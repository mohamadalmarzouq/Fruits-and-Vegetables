# Fix Static Site Build Error

## Problem
Build is failing with: `bash: line 1: cd: frontend: No such file or directory`

## Solution: Update Render Static Site Settings

### Option 1: Set Root Directory (Recommended)

1. Go to your Static Site on Render: **Fruits-and-Vegetables-1**
2. Go to **Settings** → **Build**
3. Set **Root Directory** to: `frontend`
4. Update **Build Command** to: `npm install && npm run build` (remove `cd frontend &&`)
5. Set **Publish Directory** to: `dist` (not `frontend/dist`)
6. Save and redeploy

### Option 2: Keep Root Directory Empty

If you want to keep Root Directory empty:
1. **Build Command** should be: `cd frontend && npm install && npm run build`
2. **Publish Directory** should be: `frontend/dist`

But this requires the `frontend` folder to exist at the repo root, which it should.

## Recommended Settings

**Root Directory:** `frontend`
**Build Command:** `npm install && npm run build`
**Publish Directory:** `dist`

This is the cleanest approach and should work reliably.

