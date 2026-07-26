# Farm Manager V5 Mobile Edition

V5 adds:
- Nursery and seed propagation batches
- Germination and seedling-loss tracking
- Transplant-readiness status
- Crop cycles linked to fields
- Optional nursery-batch-to-crop-cycle traceability
- Live dashboard nursery metrics

## Upgrade steps

1. Open Supabase SQL Editor.
2. Run `database-upgrade.sql`.
3. Extract this ZIP.
4. Upload every extracted file directly to the root of the existing GitHub repository.
5. Replace the existing files when GitHub asks.
6. Commit the upload. Netlify will deploy automatically.

No `src` folder is required.
