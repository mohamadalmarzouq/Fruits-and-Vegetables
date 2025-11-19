# Render Setup Instructions

Follow these steps to set up your Render infrastructure before we start coding.

## Step 1: Create PostgreSQL Database

1. Go to your Render Dashboard: https://dashboard.render.com
2. Click **"New +"** → Select **"PostgreSQL"**
3. Configure:
   - **Name**: `fruits-vegetables-db` (or your preferred name)
   - **Database**: `fruits_vegetables` (or your preferred name)
   - **User**: `fruits_user` (or auto-generated)
   - **Region**: Choose closest to you (e.g., `Oregon (US West)`)
   - **PostgreSQL Version**: Latest (15 or 16)
   - **Plan**: Free tier is fine for MVP/testing
4. Click **"Create Database"**
5. **IMPORTANT**: Wait for it to be fully provisioned (green status)
6. Once ready, click on the database name
7. Copy the **"Internal Database URL"** - you'll need this later
8. Also copy the **"External Database URL"** - for local development

## Step 2: Create Persistent Disk (for File Uploads)

1. In Render Dashboard, click **"New +"** → Select **"Disk"**
2. Configure:
   - **Name**: `fruits-vegetables-uploads`
   - **Mount Path**: `/uploads` (this is where files will be stored)
   - **Size**: 1 GB is fine for MVP/testing (you can increase later)
   - **Region**: Same region as your PostgreSQL database
3. Click **"Create Disk"**
4. **Note**: You'll attach this disk to your backend web service later

## Step 3: Create Backend Web Service (We'll configure this after code is ready)

For now, just know you'll need to:
1. Create a new **"Web Service"**
2. Connect it to your GitHub repository
3. Attach the PostgreSQL database
4. Attach the persistent disk
5. Set environment variables (see below)

## Step 4: Environment Variables to Prepare

Once we create the code, you'll need to set these in your Render Web Service:

### Backend Environment Variables (for Web Service)

```
DATABASE_URL=<Internal Database URL from Step 1>
JWT_SECRET=<Generate a random long string, e.g., use: openssl rand -base64 32>
JWT_EXPIRES_IN=7d
PORT=10000
NODE_ENV=production
UPLOAD_DIR=/uploads
FRONTEND_URL=<Your frontend URL, e.g., https://your-frontend.onrender.com>
```

### How to Generate JWT_SECRET:

Run this in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and use it as your `JWT_SECRET`.

## Step 5: Local Development Environment Variables

For local development, create a `.env` file in the `backend/` folder:

```env
DATABASE_URL=<External Database URL from Step 1>
JWT_SECRET=<Same as production, or different for local>
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:3000
```

## Quick Checklist

- [ ] PostgreSQL database created and running
- [ ] Internal Database URL copied
- [ ] External Database URL copied (for local dev)
- [ ] Persistent disk created
- [ ] JWT_SECRET generated
- [ ] Ready to proceed with code setup

## Important Notes

1. **Database URL**: Use **Internal Database URL** in Render (for production), **External Database URL** for local development
2. **Disk Mount**: The disk will be mounted at `/uploads` in your web service
3. **Free Tier Limits**: 
   - PostgreSQL: 90 days free, then $7/month
   - Disk: $0.25/GB/month
   - Web Service: Free tier available (spins down after inactivity)
4. **Security**: Never commit `.env` files to Git

## Next Steps After Setup

Once you've completed these steps, let me know and I'll:
1. Set up the project structure
2. Configure the database connection
3. Set up the code to use these Render services
4. Create migration scripts
5. Start building the vendor panel

---

**Ready?** Complete Steps 1-2 above, then let me know when done and we'll proceed with the code!

