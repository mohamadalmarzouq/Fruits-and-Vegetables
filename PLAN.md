# Fruits & Vegetables Marketplace - Implementation Plan

## Project Overview
A hidden marketplace that aggregates vendor prices for fruits and vegetables, allowing users to find the best deals without seeing vendor names.

## Technology Stack Recommendation

### Backend
- **Framework**: Node.js with Express.js (or Python with FastAPI)
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **File Upload**: Multer (Node.js) or similar, storing to disk initially
- **ORM**: Prisma or Sequelize (Node.js) / SQLAlchemy (Python)

### Frontend
- **Framework**: React with Next.js (or React with Vite)
- **State Management**: React Context or Zustand
- **UI Library**: Tailwind CSS + shadcn/ui or Material-UI
- **Forms**: React Hook Form

### Deployment
- **Platform**: Render
- **Database**: Render PostgreSQL
- **Storage**: Render Disk (for MVP), upgrade to S3 later

## Database Schema

### Users Table
- id (UUID, Primary Key)
- email (String, Unique)
- password_hash (String)
- role (Enum: 'vendor', 'buyer', 'admin')
- vendor_status (Enum: 'pending', 'approved', 'rejected') - nullable, only for vendors
- created_at (Timestamp)
- updated_at (Timestamp)

### Products Catalog (Master List - Admin Managed)
- id (UUID, Primary Key)
- name (String, Unique) - e.g., "Tomato", "Orange"
- category (Enum: 'fruit', 'vegetable')
- created_at (Timestamp)
- updated_at (Timestamp)

### Vendor Products (Vendor Inventory)
- id (UUID, Primary Key)
- vendor_id (UUID, Foreign Key → Users)
- product_id (UUID, Foreign Key → Products Catalog)
- quantity (Decimal) - e.g., 500
- unit (Enum: 'kg', 'gram')
- price (Decimal) - in KWD
- origin (String) - e.g., "Spain", "Turkey"
- image_url (String) - path to uploaded image
- is_active (Boolean) - for soft delete
- created_at (Timestamp)
- updated_at (Timestamp)

### Shopping Lists
- id (UUID, Primary Key)
- buyer_id (UUID, Foreign Key → Users)
- status (Enum: 'draft', 'completed')
- created_at (Timestamp)
- updated_at (Timestamp)

### Shopping List Items
- id (UUID, Primary Key)
- shopping_list_id (UUID, Foreign Key → Shopping Lists)
- product_id (UUID, Foreign Key → Products Catalog)
- quantity (Decimal)
- unit (Enum: 'kg', 'gram')
- origin_preference (String, Nullable)
- created_at (Timestamp)

### Shopping List Selections (User's chosen vendor options)
- id (UUID, Primary Key)
- shopping_list_id (UUID, Foreign Key → Shopping Lists)
- shopping_list_item_id (UUID, Foreign Key → Shopping List Items)
- vendor_product_id (UUID, Foreign Key → Vendor Products)
- created_at (Timestamp)

### Orders (Checkout Summary)
- id (UUID, Primary Key)
- shopping_list_id (UUID, Foreign Key → Shopping Lists)
- buyer_id (UUID, Foreign Key → Users)
- subtotal (Decimal)
- platform_commission (Decimal) - 5% of subtotal
- grand_total (Decimal)
- created_at (Timestamp)

### Order Items
- id (UUID, Primary Key)
- order_id (UUID, Foreign Key → Orders)
- vendor_product_id (UUID, Foreign Key → Vendor Products)
- quantity (Decimal)
- unit_price (Decimal)
- total_price (Decimal)
- created_at (Timestamp)

## Implementation Phases

### Phase 1: Project Setup & Infrastructure ✅
1. Initialize project structure
2. Set up backend (Express.js/Node.js)
3. Set up frontend (React/Next.js)
4. Configure PostgreSQL connection
5. Set up Prisma/ORM
6. Configure file upload middleware
7. Set up authentication (JWT)
8. Create environment variables structure
9. Set up Render deployment configuration

### Phase 2: Vendor Panel 🎯 (Current Focus)
1. **Vendor Authentication**
   - Vendor registration
   - Vendor login
   - JWT token management

2. **Vendor Dashboard**
   - View all uploaded products
   - Quick stats (total products, active products)

3. **Product Upload Form**
   - Product type dropdown (Fruit/Vegetable)
   - Product name dropdown (from master catalog)
   - Unit selection (KG/Gram)
   - Amount input
   - Price input (KWD)
   - Origin dropdown/input (admin configurable)
   - Image upload (required)
   - Form validation

4. **Product Management**
   - Edit existing products
   - Update price/quantity
   - Deactivate/delete products
   - View product details

5. **Vendor Profile**
   - View profile information
   - Update email/password

### Phase 3: Admin Panel
1. **Admin Authentication**
   - Admin login
   - Admin dashboard

2. **Vendor Management**
   - View pending vendor registrations
   - Approve/reject vendors
   - View all vendors
   - View vendor details

3. **Master Catalog Management**
   - Add new products to catalog
   - Edit product names
   - Delete products
   - View all products in catalog

4. **Origin Management**
   - Add/edit/delete origins
   - View all origins

5. **Unit Management**
   - Configure available units (KG, Gram)

6. **Order Management**
   - View all orders
   - View order details (including vendor names - admin only)
   - View platform commission reports

### Phase 4: User/Buyer Panel
1. **User Authentication**
   - User registration
   - User login

2. **Shopping List Creation**
   - Product selection (from catalog)
   - Quantity input
   - Unit selection
   - Origin preference (optional)
   - Add to list
   - Remove from list
   - View current list

3. **Price Comparison View**
   - Display all matching vendor products
   - Sort by price (lowest first)
   - Deduplication logic (same product/origin/quantity/price = one entry)
   - Best price badge
   - User selection interface
   - Product images display

4. **Checkout Summary**
   - Selected items summary
   - Price breakdown
   - Subtotal
   - Grand total (commission hidden from user)
   - Order confirmation

## Key Business Logic

### Matching Algorithm
1. For each shopping list item:
   - Find all vendor products matching:
     - Same product_id
     - Same or compatible unit (handle conversions)
     - Quantity >= user requested quantity
     - Active products only
   - Filter by origin preference if specified
   - Sort by price (ascending)
   - Apply deduplication:
     - Group by: product_id, origin, quantity, price
     - Show only one entry per group

### Deduplication Logic
```javascript
// Pseudo-code
grouped = groupBy(vendorProducts, ['product_id', 'origin', 'quantity', 'price'])
uniqueOptions = grouped.map(group => group[0]) // Take first from each group
```

### Commission Calculation
- Platform commission: 5% of subtotal
- Hidden from user checkout
- Visible in admin panel
- Deducted from vendor payout (future feature)

## File Structure

```
Fruits-and-Vegetables/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   └── app.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── uploads/ (or use Render disk)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
├── .gitignore
├── README.md
└── PLAN.md
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Render Deployment Checklist

### Backend Service
- [ ] Create PostgreSQL database on Render
- [ ] Create Web Service for backend
- [ ] Set environment variables
- [ ] Configure build command
- [ ] Configure start command
- [ ] Set up persistent disk for uploads

### Frontend Service
- [ ] Create Static Site or Web Service
- [ ] Set environment variables
- [ ] Configure build command

## Next Steps

1. ✅ Review and approve this plan
2. Start Phase 1: Project Setup
3. Implement Phase 2: Vendor Panel
4. Implement Phase 3: Admin Panel
5. Implement Phase 4: User Panel
6. Testing & Deployment

## Questions to Clarify

1. Should vendors be able to see their own order history?
2. Should there be email notifications for vendor approvals?
3. What's the maximum file size for product images?
4. Should there be pagination for product listings?
5. Do we need search/filter functionality in vendor panel?

