# Farm Manager V8.2.1 Android Upgrade

## First: activate attendance in Supabase

1. Extract `farm-manager-v8-2-1-password-recovery-vercel-flat.zip`.
2. Open `database-v8-2-attendance.sql` and copy all its text.
3. In Supabase, open **SQL Editor** and tap **New query**.
4. Paste the text, tap **Run**, and wait for **Success**.

## Then: upload the app to GitHub

1. In the existing Farm Manager GitHub repository, tap **Add file** then **Upload files**.
2. Select all extracted files and upload them at the repository's top level.
3. Replace matching files when GitHub asks.
4. Enter `Upgrade Farm Manager to V8.2.1 password recovery`.
5. Commit directly to `main`.
6. Wait for Vercel to deploy automatically, then refresh the website.

Workers created under **Workers** are attendance records only. They cannot sign in.
Only accounts listed under **Users & Access** can log in to Farm Manager.

## Finally: enable password recovery

1. In Supabase, open **Authentication** then **URL Configuration**.
2. Set **Site URL** to the live Farm Manager Vercel address.
3. Add the same address followed by `/**` under **Redirect URLs**.
4. Save, then open Farm Manager and tap **Forgot admin password?** to test it.

The recovery email opens a secure page where the administrator enters and confirms a
new password. Attendance, users and all farm records remain unchanged.
