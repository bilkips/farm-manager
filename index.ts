import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const allowedRoles = new Set(["owner", "manager", "storekeeper", "supervisor", "viewer"]);
const allowedStatuses = new Set(["active", "inactive"]);

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
    const serviceRoleKey = secretKeys
      ? JSON.parse(secretKeys).default
      : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authorization = request.headers.get("Authorization");

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ ok: false, error: "The server is missing its Supabase environment settings." }, 500);
    }
    if (!authorization?.startsWith("Bearer ")) {
      return json({ ok: false, error: "You must be signed in." }, 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const accessToken = authorization.replace(/^Bearer\s+/i, "");
    const { data: authData, error: authError } = await admin.auth.getUser(accessToken);
    if (authError || !authData.user) return json({ ok: false, error: "Your session is no longer valid." }, 401);

    const actor = authData.user;
    const { data: actorProfile, error: profileError } = await admin
      .from("farm_profiles")
      .select("id,farm_id,role,status,email")
      .eq("id", actor.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!actorProfile || actorProfile.role !== "owner" || actorProfile.status !== "active") {
      return json({ ok: false, error: "Only an active Owner / Administrator can manage user accounts." }, 403);
    }

    const body = await request.json();
    const action = String(body.action || "").toLowerCase();

    const writeAudit = async (recordId: string, auditAction: string) => {
      await admin.from("activity_log").insert({
        farm_id: actorProfile.farm_id,
        actor_id: actor.id,
        actor_email: actor.email,
        table_name: "farm_profiles",
        record_id: recordId,
        action: auditAction,
      });
    };

    if (action === "create") {
      const fullName = String(body.full_name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const role = String(body.role || "viewer").toLowerCase();

      if (!fullName) return json({ ok: false, error: "Full name is required." }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ ok: false, error: "Enter a valid email address." }, 400);
      }
      if (password.length < 8) {
        return json({ ok: false, error: "The temporary password must have at least 8 characters." }, 400);
      }
      if (!allowedRoles.has(role)) return json({ ok: false, error: "The selected role is invalid." }, 400);

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (createError || !created.user) {
        return json({ ok: false, error: createError?.message || "The account could not be created." }, 400);
      }

      const { error: saveProfileError } = await admin.from("farm_profiles").upsert({
        id: created.user.id,
        farm_id: actorProfile.farm_id,
        full_name: fullName,
        email,
        role,
        status: "active",
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

      if (saveProfileError) {
        await admin.auth.admin.deleteUser(created.user.id);
        throw saveProfileError;
      }

      await writeAudit(created.user.id, "CREATE_USER");
      return json({
        ok: true,
        user: { id: created.user.id, full_name: fullName, email, role, status: "active" },
      });
    }

    const userId = String(body.user_id || "");
    if (!userId) return json({ ok: false, error: "A user account must be selected." }, 400);

    const { data: target, error: targetError } = await admin
      .from("farm_profiles")
      .select("id,farm_id,full_name,email,role,status")
      .eq("id", userId)
      .eq("farm_id", actorProfile.farm_id)
      .maybeSingle();

    if (targetError) throw targetError;
    if (!target) return json({ ok: false, error: "That user does not belong to this farm." }, 404);

    if (action === "update") {
      const patch: Record<string, string> = {};
      if (body.role !== undefined) {
        const role = String(body.role).toLowerCase();
        if (!allowedRoles.has(role)) return json({ ok: false, error: "The selected role is invalid." }, 400);
        patch.role = role;
      }
      if (body.status !== undefined) {
        const status = String(body.status).toLowerCase();
        if (!allowedStatuses.has(status)) return json({ ok: false, error: "The selected status is invalid." }, 400);
        patch.status = status;
      }
      if (!Object.keys(patch).length) return json({ ok: false, error: "No supported user change was supplied." }, 400);
      if (userId === actor.id && (
        (patch.role !== undefined && patch.role !== "owner") || patch.status === "inactive"
      )) {
        return json({ ok: false, error: "You cannot remove or deactivate your own Administrator access." }, 400);
      }

      const { error: updateError } = await admin
        .from("farm_profiles")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .eq("farm_id", actorProfile.farm_id);
      if (updateError) throw updateError;

      await writeAudit(userId, "UPDATE_USER");
      return json({ ok: true });
    }

    if (action === "delete") {
      if (userId === actor.id) {
        return json({ ok: false, error: "You cannot delete your own Administrator account." }, 400);
      }

      const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
      if (deleteError) return json({ ok: false, error: deleteError.message }, 400);

      await writeAudit(userId, "DELETE_USER");
      return json({ ok: true });
    }

    return json({ ok: false, error: "Unsupported user action." }, 400);
  } catch (error) {
    return json({
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected server error.",
    }, 500);
  }
});
