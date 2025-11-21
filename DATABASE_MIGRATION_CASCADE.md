# Database Migration: Add Cascade Delete

## Issue
Foreign key constraints were preventing deletion of shopping lists and items because related records (selections) weren't being deleted first.

## Changes Made
1. Updated Prisma schema to add `onDelete: Cascade` to:
   - `ShoppingListItem.shoppingList` relation
   - `ShoppingListSelection.shoppingList` relation
   - `ShoppingListSelection.shoppingListItem` relation

2. Updated controller functions to manually delete related records before parent deletion (for safety).

## Migration Steps on Render

After deploying the backend, run in Render Shell:

```bash
cd backend
npx prisma db push
```

This will:
- Update the foreign key constraints to include `ON DELETE CASCADE`
- Allow shopping lists and items to be deleted properly

## What This Fixes
- ✅ Deleting shopping list items now works
- ✅ Deleting shopping lists now works
- ✅ All related selections are automatically removed when parent records are deleted

