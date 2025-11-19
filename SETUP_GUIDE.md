# Quick Setup Guide

## Local Development Setup

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL and JWT_SECRET
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Render Deployment Steps

### Step 1: Create PostgreSQL Database
1. Go to Render Dashboard → New + → PostgreSQL
2. Name: `fruits-vegetables-db`
3. Copy **Internal Database URL** (for production)
4. Copy **External Database URL** (for local dev)

### Step 2: Create Persistent Disk
1. Render Dashboard → New + → Disk
2. Name: `fruits-vegetables-uploads`
3. Mount Path: `/uploads`
4. Size: 1 GB

### Step 3: Deploy Backend
1. Render Dashboard → New + → Web Service
2. Connect GitHub repository
3. Settings:
   - **Name**: `fruits-vegetables-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run prisma:generate`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   ```
   DATABASE_URL=<Internal Database URL>
   JWT_SECRET=<Your generated secret>
   JWT_EXPIRES_IN=7d
   PORT=10000
   NODE_ENV=production
   UPLOAD_DIR=/uploads
   FRONTEND_URL=<Your frontend URL>
   ```
5. Attach PostgreSQL database
6. Attach persistent disk (mount at `/uploads`)
7. Deploy
8. After deployment, run migrations:
   - Go to Shell/Console
   - Run: `npm run prisma:deploy`
   - Run: `npm run prisma:seed`

### Step 4: Deploy Frontend
1. Render Dashboard → New + → Static Site
2. Connect GitHub repository
3. Settings:
   - **Name**: `fruits-vegetables-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=<Your backend URL>/api
   ```
5. Deploy

## Testing the Vendor Panel

1. Register a vendor account at `/vendor/register`
2. Wait for admin approval (or manually approve in database)
3. Login at `/vendor/login`
4. Upload products from the dashboard

## Creating Admin User (for testing)

Run this in Prisma Studio or database:
```sql
-- Create admin user (password: admin123 - change this!)
-- You'll need to hash the password first using bcrypt
-- Or use the API to create one, then update role in database
```

Or use Prisma Studio:
```bash
cd backend
npm run prisma:studio
```

Then manually create an admin user with:
- email: admin@example.com
- role: admin
- passwordHash: (hash of your password)

## Troubleshooting

### Database Connection Issues
- Make sure DATABASE_URL is correct
- For Render, use Internal Database URL
- For local, use External Database URL

### Image Upload Issues
- Check UPLOAD_DIR is set correctly
- Make sure disk is mounted at `/uploads` on Render
- Check file permissions

### CORS Issues
- Make sure FRONTEND_URL matches your frontend domain
- Check backend CORS configuration

