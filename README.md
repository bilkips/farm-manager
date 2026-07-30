# Farm Manager V7.3 — Android Flat Package

This phone-friendly package contains no required subfolders. Every file can be uploaded at
the top level of the GitHub repository, even when Android flattens extracted files.

V7.3 upgrades the working V7.2 farm system without changing the existing farm-data structure.

## What is new

- Dashboard greeting uses the signed-in user's first name and the current time:
  `Good morning, Billy`, `Good afternoon, Billy`, or `Good evening, Billy`
- Three original farm photographs are bundled locally for the dashboard and imported from the
  top level
- Owner / Administrator can create users with a name, email, temporary password and role
- Owner / Administrator can activate, deactivate and permanently delete user accounts
- The signed-in Administrator cannot demote, deactivate or delete their own account
- User administration runs inside a protected Supabase Edge Function; the browser keeps using
  the public publishable key

All existing V7.2 modules, records, roles, permissions and activity history are preserved.

## Android and GitHub upgrade steps

1. Confirm that `database-v7-2-users.sql` has already been run in Supabase.
2. Extract this ZIP. All extracted files should appear together in one folder.
3. Open the GitHub repository and select **Add file → Upload files**.
4. Select every extracted file and upload them at the repository's top level.
5. Commit the upload to the `main` branch.
6. Deploy the included `admin-users` Edge Function by following
   `SUPABASE-FUNCTION-SETUP.md`.
7. Wait for Netlify to complete the new deployment.
8. Sign in with the Owner / Admin account and open **Users & Access**.
9. Tap **Add user** to create the first managed user.

No new SQL script is required for V7.3.

Do not upload the ZIP itself. Upload the files extracted from it.

`admin-users-function.ts` can remain at the GitHub repository's top level. Netlify ignores it;
you will copy its contents into the Supabase Edge Function editor.

## User access

New users created by the Administrator are active immediately and do not consume a
confirmation-email request. Give the temporary password to the user privately. The user can
select **Forgot password?** on the sign-in page to choose a replacement password.

Deleting an account removes that person's login and profile. Existing farm production records
remain in the system.

Keep all earlier database upgrade files; they are included for reference.
