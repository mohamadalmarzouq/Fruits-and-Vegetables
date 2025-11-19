# Troubleshooting: Registration Failed

## Common Issues & Solutions

### 1. **VITE_API_URL Not Set in Render**

**Problem:** Frontend can't find the backend API.

**Solution:**
1. Go to your Static Site on Render
2. Go to **Environment** tab
3. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-service.onrender.com/api`
   - (Replace `your-backend-service` with your actual backend service name)
4. **Redeploy** the static site (important - environment variables need a redeploy)

### 2. **Backend Not Running**

**Check:**
- Go to your backend web service on Render
- Check if it's showing "Live" status
- Check the logs for any errors

**Solution:**
- Make sure backend deployed successfully
- Check that database migrations ran: `npm run prisma:deploy`
- Verify environment variables are set correctly

### 3. **CORS Error**

**Problem:** Browser blocks requests due to CORS policy.

**Solution:**
- Make sure `FRONTEND_URL` in backend environment variables matches your frontend URL
- Example: `FRONTEND_URL=https://fruits-and-vegetables-1.onrender.com`

### 4. **Network Error**

**Problem:** Frontend can't reach backend.

**Check:**
- Open browser console (F12)
- Look for network errors
- Check if API URL is correct

**Solution:**
- Verify backend URL is correct
- Make sure backend is accessible (try opening backend URL in browser)

## Quick Debug Steps

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for error messages
   - Check Network tab to see failed requests

2. **Verify API URL:**
   - The frontend should be calling: `https://your-backend.onrender.com/api/auth/register/vendor`
   - Check if this URL is correct in Network tab

3. **Test Backend Directly:**
   - Try: `https://your-backend.onrender.com/api/health`
   - Should return: `{"status":"ok","message":"Fruits & Vegetables API is running"}`

4. **Check Environment Variables:**
   - Backend: `FRONTEND_URL` should match your frontend URL
   - Frontend: `VITE_API_URL` should match your backend URL + `/api`

## Most Likely Issue

**90% of the time, it's missing `VITE_API_URL` in the static site environment variables.**

Make sure to:
1. Add `VITE_API_URL` environment variable
2. **Redeploy** the static site (environment variables require a rebuild)

