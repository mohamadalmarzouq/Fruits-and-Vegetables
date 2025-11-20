# Database Migration Required

## New Field Added
We've added a `buyerType` field to the User model to track if a buyer is an "individual" or "organization".

## Run Migration on Render

After deploying the backend, you need to run a migration:

1. Go to your Backend Web Service on Render → **Shell** tab
2. Run:
```bash
cd backend
npx prisma migrate dev --name add_buyer_type
```

Or if you want to push the schema directly:
```bash
cd backend
npx prisma db push
```

This will add the `buyer_type` column to the `users` table.

## What Changed
- Added `BuyerType` enum: `individual` or `organization`
- Added `buyerType` field to User model (nullable, only for buyers)

