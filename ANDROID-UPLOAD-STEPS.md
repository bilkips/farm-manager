# Upload V7.3 from Android

This package is intentionally flat. You do not need to create `public`, `images`,
`supabase`, or `functions` folders in GitHub.

1. Download and extract `farm-manager-v7-3-android-flat.zip`.
2. Open the extracted folder in Android's file picker, not the **Recent** screen.
3. Select all extracted files.
4. In the GitHub repository, tap **Add file**, then **Upload files**.
5. Upload the selected files at the repository's top level.
6. Enter `Upload Farm Manager V7.3 Android package`.
7. Commit directly to the `main` branch.
8. Wait for the Netlify deployment to finish.

The three `.webp` files are the dashboard pictures. Keep them at the same level as
`App.jsx`.

For Administrator add/delete-user controls, follow `SUPABASE-FUNCTION-SETUP.md` and
paste the contents of `admin-users-function.ts` into the Supabase function editor.
