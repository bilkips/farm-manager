# Farm Manager V7.3

V7.3 upgrades the working V7.2 farm system without changing the existing farm-data structure.

## What is new

- Dashboard greeting uses the signed-in user's first name and the current time:
  `Good morning, Billy`, `Good afternoon, Billy`, or `Good evening, Billy`
- Three original farm photographs are bundled locally for the dashboard
- Owner / Administrator can create users with a name, email, temporary password and role
- Owner / Administrator can activate, deactivate and permanently delete user accounts
- The signed-in Administrator cannot demote, deactivate or delete their own account
- User administration runs inside a protected Supabase Edge Function; the browser keeps using
  the public publishable key

All existing V7.2 modules, records, roles, permissions and activity history are preserved.

## Upgrade steps

1. Confirm that `database-v7-2-users.sql` has already been run in Supabase.
2. Deploy the included `admin-users` Edge Function by following
   `SUPABASE-FUNCTION-SETUP.md`.
3. Upload all V7.3 project files to the same GitHub repository, replacing V7.2.
4. Wait for Netlify to complete the new deployment.
5. Sign in with the Owner / Admin account and open **Users & Access**.
6. Tap **Add user** to create the first managed user.

No new SQL script is required for V7.3.

## User access

New users created by the Administrator are active immediately and do not consume a
confirmation-email request. Give the temporary password to the user privately. The user can
select **Forgot password?** on the sign-in page to choose a replacement password.

Deleting an account removes that person's login and profile. Existing farm production records
remain in the system.

Keep all earlier database upgrade files; they are included for reference.
