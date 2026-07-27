# Farm Manager V7.2

V7.2 upgrades the working V7.1 farm system with:

- Secure email/password sign-in and sign-out
- Self-service account creation and password reset
- Owner, Farm Manager, Storekeeper, Field Supervisor and Viewer roles
- User activation/deactivation and role assignment
- Role-aware navigation, editing and financial visibility
- Database-level access policies
- Activity log showing who changed farm records

## Upgrade steps

1. Open your Supabase project.
2. Open **SQL Editor**.
3. Run `database-v7-2-users.sql` once.
4. Upload all project files to the same GitHub repository, replacing V7.1.
5. Wait for Netlify to deploy the new version.
6. Open the app and create the first account. The first registered account becomes Owner/Admin.

New accounts created later start as Viewer. The Owner can change their roles in **Users & Access**.

Keep all earlier database upgrade files; they are included for reference.
