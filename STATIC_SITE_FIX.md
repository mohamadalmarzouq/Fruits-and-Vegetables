# Fix Static Site 404 Error on Render

## Problem
Getting "Not Found" when accessing the frontend URL.

## Solution: Check Render Static Site Settings

### 1. Verify Publish Directory
In your Static Site settings on Render:
- **Publish Directory** should be: `dist` (not `frontend/dist`)

### 2. Verify Build Command
- **Build Command** should be: `cd frontend && npm install && npm run build`

### 3. Verify Root Directory (if using)
- **Root Directory** should be: `frontend` (if the option exists)

### 4. Check Build Output
After deployment, check the build logs to ensure:
- The build completed successfully
- Files were generated in the `dist` folder
- `index.html` exists in the `dist` folder

## Alternative: If Root Directory is Set

If you have **Root Directory** set to `frontend`:
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

## Quick Test

After fixing settings, try accessing:
- `https://fruits-and-vegetables-1.onrender.com/` (should show login page)
- `https://fruits-and-vegetables-1.onrender.com/vendor/login` (should also work)

The `_redirects` file I added should handle React Router routes, but first we need to make sure the static site is serving the `index.html` correctly.

