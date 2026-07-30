# Deploy the Administrator user service

The **Add user** and **Delete user** buttons need the included `admin-users` Supabase Edge
Function. This keeps account-creation and deletion privileges off the public website.

## Easiest method: Supabase Dashboard

1. Sign in to Supabase and open the Farm Manager project.
2. In the left sidebar, open **Edge Functions**.
3. Select **Deploy a new function**, then **Via Editor**.
4. Name the function exactly:

   `admin-users`

5. Open the top-level `admin-users-function.ts` file from this Android package.
6. Copy the complete file into the Supabase editor, replacing the sample code.
7. Select **Deploy function** and wait for the success message.

Supabase provides `SUPABASE_URL` and the protected server key to hosted Edge Functions
automatically. Do not paste a secret/service-role key into `App.jsx`, GitHub, Netlify or any
browser file.

## Quick test

1. Open the deployed Farm Manager app.
2. Sign in as Owner / Admin.
3. Open **Users & Access**.
4. Add a test Viewer account.
5. Sign out and confirm that the new account can sign in.
6. Sign back in as Owner / Admin and delete the test account.

If the app says the Administrator user service is not deployed, confirm that the function name
is exactly `admin-users`.
