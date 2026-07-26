# Farm Manager V6.2

Updates:
- Delete farm blocks, fields, nursery batches, crop cycles, activities and workers
- Confirmation before deletion
- A nursery batch is automatically marked Transplanted after its linked crop cycle is created
- Transplanted batches no longer appear as available nursery sources
- Dashboard statistics link to their modules
- Dashboard Nursery and Crop Cycle cards link to full pages

## Upgrade

1. Run `database-v6-2-delete.sql` in Supabase SQL Editor.
2. Upload all extracted files to the root of GitHub.
3. Replace existing files and commit.
4. Netlify redeploys automatically.
