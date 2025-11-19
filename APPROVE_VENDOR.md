# How to Approve Your Vendor Account

## Option 1: Create Admin User & Use Admin Panel (Recommended)

### Step 1: Create Admin User via Render Shell

1. Go to your Backend Web Service on Render → **Shell** tab
2. Run this command (replace email/password with your choice):

```bash
cd backend
node -e "import('./src/utils/createAdmin.js').then(m => m.createAdmin('admin@example.com', 'your-password-here'))"
```

Or use Node.js directly:
```bash
cd backend
node src/utils/createAdmin.js admin@example.com your-password-here
```

### Step 2: Build Admin Panel (Next Step)
After creating admin, we'll build the admin panel so you can approve vendors through the UI.

---

## Option 2: Manually Approve via Database (Quick Fix)

### Using Render Shell + Prisma Studio

1. Go to Backend Web Service → **Shell**
2. Run:
```bash
cd backend
npm run prisma:studio
```

3. This will give you a URL (like `http://localhost:5555`)
4. Since you're on Render, you'll need to use a different method...

### Using SQL Directly

1. Go to your PostgreSQL database on Render
2. Click **Connect** → Get connection string
3. Use a PostgreSQL client or Render's database dashboard
4. Run this SQL:

```sql
UPDATE users 
SET vendor_status = 'approved' 
WHERE email = 'mohammad.almarzouq@outlook.com';
```

---

## Option 3: Quick Script to Approve Vendor

Create a simple script to approve your vendor:

```bash
cd backend
node -e "
import('./src/config/database.js').then(async ({default: prisma}) => {
  const user = await prisma.user.update({
    where: { email: 'mohammad.almarzouq@outlook.com' },
    data: { vendorStatus: 'approved' }
  });
  console.log('Vendor approved:', user.email);
  await prisma.\$disconnect();
});
"
```

---

## Recommended: Let's Build Admin Panel

Since we planned to build the admin panel next anyway, let's:
1. Create an admin user
2. Build the admin panel
3. You can approve vendors through the UI

This is the best long-term solution!

