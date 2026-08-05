# Farm Manager V8.2 Android Upgrade

## First: activate attendance in Supabase

1. Extract `farm-manager-v8-2-attendance-vercel-flat.zip`.
2. Open `database-v8-2-attendance.sql` and copy all its text.
3. In Supabase, open **SQL Editor** and tap **New query**.
4. Paste the text, tap **Run**, and wait for **Success**.

## Then: upload the app to GitHub

1. In the existing Farm Manager GitHub repository, tap **Add file** then **Upload files**.
2. Select all extracted files and upload them at the repository's top level.
3. Replace matching files when GitHub asks.
4. Enter `Upgrade Farm Manager to V8.2 attendance`.
5. Commit directly to `main`.
6. Wait for Vercel to deploy automatically, then refresh the website.

Workers created under **Workers** are attendance records only. They cannot sign in.
Only accounts listed under **Users & Access** can log in to Farm Manager.
