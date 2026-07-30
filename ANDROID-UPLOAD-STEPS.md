# Upload Farm Manager V8 from Android

This package is intentionally flat. You do not need to create any folders in GitHub.

1. Download and extract `farm-manager-v8-smart-farm-android-flat.zip`.
2. Open the extracted folder in Android's file picker, not the **Recent** screen.
3. Select every extracted file.
4. In the existing GitHub repository, tap **Add file**, then **Upload files**.
5. Upload the files at the repository's top level.
6. Replace files with the same names when GitHub asks.
7. Enter `Upgrade Farm Manager to V8 Smart Farm`.
8. Commit directly to the `main` branch.
9. Wait for Netlify to finish deploying.
10. Refresh the Farm Manager website and sign in normally.

Keep the three `.webp` pictures at the same level as `App.jsx`.

No Supabase action is required. Do not create another function or run another SQL script.
The app continues using the existing working `super-handler`.
