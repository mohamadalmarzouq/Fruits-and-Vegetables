import express from 'express';
import { 
  createProduct, 
  getMyProducts, 
  getProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/vendorProductController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import prisma from '../config/database.js';

const router = express.Router();

// All routes require vendor authentication
router.use(authenticate);
router.use(requireRole('vendor'));

// Verify vendor is approved
router.use(async (req, res, next) => {
  try {
    const vendor = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!vendor) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (vendor.vendorStatus !== 'approved') {
      return res.status(403).json({ 
        error: 'Your vendor account is pending approval' 
      });
    }

    next();
  } catch (error) {
    next(error);
  }
});

router.post('/', upload.single('image'), createProduct);
router.get('/', getMyProducts);
router.get('/:id', getProduct);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

export default router;

