# Farm Manager V8.3.1 Android Upgrade

## Database: no new SQL for this upgrade

Your attendance calendar is already working, so do not run another SQL script for V8.3.1.
The included `database-v8-2-attendance.sql` is only for a new installation where
attendance has never been activated.

## Upload the app to GitHub

1. Extract `farm-manager-v8-3-1-blank-screen-fix-vercel-flat.zip`.
2. In the existing Farm Manager GitHub repository, tap **Add file** then **Upload files**.
3. Select all eight extracted files and upload them at the repository's top level.
4. Replace matching files when GitHub asks.
5. Enter `Fix Farm Manager V8.3.1 blank screen`.
6. Commit directly to `main`.
7. Wait for Vercel to deploy automatically, then refresh the website.

Workers created under **Workers** are attendance records only. They cannot sign in.
Only accounts listed under **Users & Access** can log in to Farm Manager.

## Finally: enable password recovery

1. In Supabase, open **Authentication** then **URL Configuration**.
2. Set **Site URL** to the live Farm Manager Vercel address.
3. Add the same address followed by `/**` under **Redirect URLs**.
4. Save, then open Farm Manager and tap **Forgot admin password?** to test it.

The recovery email opens a secure page where the administrator enters and confirms a
new password. V8.3.1 also adds a monthly summary for every employee, including present,
absent and unmarked days, attendance rate, estimated pay and CSV download. Attendance,
users and all farm records remain unchanged.
