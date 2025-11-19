# Render Deployment Fix

## Issue
Render is trying to run `yarn start` from the root directory instead of the `backend` directory.

## Solution

### Option 1: Update Render Dashboard Settings (Recommended)

1. Go to your Render Dashboard
2. Select your backend web service
3. Go to **Settings**
4. Set **Root Directory** to: `backend`
5. Update **Build Command** to: `npm install && npm run prisma:generate`
6. Update **Start Command** to: `npm start`
7. Make sure **Environment** is set to: `Node`
8. Save changes and redeploy

### Option 2: Use render.yaml (If using Blueprint)

If you're using Render Blueprint (render.yaml), the file has been updated. You may need to:
1. Push the updated `render.yaml` to GitHub
2. Reconnect the service to use the Blueprint

### Important Settings Checklist

**Backend Web Service:**
- ✅ Root Directory: `backend`
- ✅ Build Command: `npm install && npm run prisma:generate`
- ✅ Start Command: `npm start`
- ✅ Environment: `Node`
- ✅ Node Version: `18` or `20` (recommended)

**After Deployment:**
1. Go to **Shell** tab in Render
2. Run: `npm run prisma:deploy`
3. Run: `npm run prisma:seed`

### Why This Happened

Render was looking for `package.json` in the root directory (`/opt/render/project/src`) but our backend code is in the `backend/` subdirectory. Setting the Root Directory tells Render where to find the `package.json` file.

