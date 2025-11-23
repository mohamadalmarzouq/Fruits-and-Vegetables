import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getVendors,
  getVendor,
  approveVendor,
  rejectVendor,
  getDashboardStats,
  refreshProductAnalysis
} from '../controllers/adminController.js';
import {
  getCatalog,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/adminCatalogController.js';
import {
  getOrders,
  getOrder,
  getCommissionSummary
} from '../controllers/adminOrderController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Vendor Management
router.get('/vendors', getVendors);
router.get('/vendors/:id', getVendor);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);

// Product Quality Analysis
router.post('/products/:productId/analyze', refreshProductAnalysis);

// Catalog Management
router.get('/catalog', getCatalog);
router.post('/catalog', createProduct);
router.put('/catalog/:id', updateProduct);
router.delete('/catalog/:id', deleteProduct);

// Order Management
router.get('/orders', getOrders);
router.get('/orders/:id', getOrder);
router.get('/orders/commission/summary', getCommissionSummary);

export default router;

