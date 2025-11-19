# Fruits & Vegetables Marketplace

A hidden marketplace platform that aggregates vendor prices for fruits and vegetables, allowing users to find the best deals without seeing vendor names.

## Features

### Vendor Panel (Current)
- Vendor registration and login
- Product upload with image
- Product management (view, edit, delete)
- Dashboard to view all products

### Admin Panel (Coming Soon)
- Vendor approval system
- Master catalog management
- Order management

### User Panel (Coming Soon)
- Shopping list creation
- Price comparison
- Checkout summary

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: React + Vite
- **Authentication**: JWT
- **File Upload**: Multer

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (local or Render)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database URL:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/fruits_vegetables
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:3000
```

5. Generate Prisma client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

7. Seed the database with initial products:
```bash
npm run prisma:seed
```

8. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Render Deployment

### Backend Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install && npm run prisma:generate`
4. Set start command: `cd backend && npm start`
5. Add environment variables:
   - `DATABASE_URL` (Internal Database URL from Render PostgreSQL)
   - `JWT_SECRET` (your generated secret)
   - `JWT_EXPIRES_IN=7d`
   - `PORT=10000`
   - `NODE_ENV=production`
   - `UPLOAD_DIR=/uploads`
   - `FRONTEND_URL` (your frontend URL)

6. Attach PostgreSQL database
7. Attach persistent disk (mount at `/uploads`)
8. Run migrations: `cd backend && npm run prisma:deploy`
9. Seed database: `cd backend && npm run prisma:seed`

### Frontend Deployment

1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/dist`
5. Add environment variable:
   - `VITE_API_URL` (your backend API URL)

## API Endpoints

### Authentication
- `POST /api/auth/register/vendor` - Register as vendor
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile (protected)

### Products (Catalog)
- `GET /api/products` - Get all products in catalog
- `GET /api/products/:id` - Get product by ID

### Vendor Products
- `POST /api/vendor/products` - Upload product (protected, vendor only)
- `GET /api/vendor/products` - Get my products (protected, vendor only)
- `GET /api/vendor/products/:id` - Get product by ID (protected, vendor only)
- `PUT /api/vendor/products/:id` - Update product (protected, vendor only)
- `DELETE /api/vendor/products/:id` - Delete product (protected, vendor only)

## Database Schema

See `backend/prisma/schema.prisma` for full schema details.

Key models:
- `User` - Users (vendors, buyers, admins)
- `Product` - Master product catalog
- `VendorProduct` - Vendor inventory
- `ShoppingList` - User shopping lists
- `Order` - Order summaries

## Development

### Running Migrations
```bash
cd backend
npm run prisma:migrate
```

### Viewing Database
```bash
cd backend
npm run prisma:studio
```

### Project Structure
```
Fruits-and-Vegetables/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   └── app.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── utils/
│   └── public/
└── README.md
```

## Next Steps

1. ✅ Vendor Panel - Complete
2. ⏳ Admin Panel - In Progress
3. ⏳ User Panel - Pending

## License

ISC

