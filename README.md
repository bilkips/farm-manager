# Farm Manager V7 Mobile Edition

V7 adds:
- Irrigation records: system, equipment, water source, duration, pressure, water volume, fuel and cost
- Spray records: product, active ingredient, target, dose, PHI, REI, weather and applicator
- Inventory with stock value and low-stock alerts
- Harvest and sales with grades, waste, buyers and revenue
- Equipment and maintenance records
- Financial dashboard with recorded costs, revenue and estimated profit
- Complete field timeline combining crop cycles, activities, irrigation, sprays and harvests
- Full add, edit and delete support for all V7 records

## Upgrade steps
1. Run `database-v7-upgrade.sql` in Supabase SQL Editor.
2. Extract the ZIP.
3. Upload all extracted files to the root of the existing GitHub repository.
4. Replace existing files and commit.
5. Netlify will redeploy automatically.
