# Configure React Router Redirects on Render

## Problem
Getting 404 errors when accessing routes like `/admin/login` or `/vendor/login` on the static site.

## Solution: Configure Redirects in Render Dashboard

### Step 1: Go to Static Site Settings
1. Go to your Static Site on Render: **Fruits-and-Vegetables-1**
2. Click on **Settings** in the left sidebar
3. Scroll down to **"Redirects/Rewrites"** section

### Step 2: Add Redirect Rule
Click **"Add Redirect"** or **"Edit"** and add:

**From:** `/*`
**To:** `/index.html`
**Status Code:** `200` (not 301 or 302)

This tells Render to serve `index.html` for all routes, allowing React Router to handle the routing client-side.

### Step 3: Save and Redeploy
- Save the changes
- Render will automatically redeploy
- After deployment, all routes should work

## Alternative: If Redirects/Rewrites Section Doesn't Exist

If you don't see a "Redirects/Rewrites" section, try:

1. Go to **Settings** → **Headers**
2. Or check if there's a **"Custom Headers"** section
3. Some Render plans might have this feature in different locations

## Manual Test

After configuring, test these URLs:
- `https://fruits-and-vegetables-1.onrender.com/` (should work)
- `https://fruits-and-vegetables-1.onrender.com/vendor/login` (should work)
- `https://fruits-and-vegetables-1.onrender.com/admin/login` (should work)

All should serve the React app and let React Router handle the routing.

