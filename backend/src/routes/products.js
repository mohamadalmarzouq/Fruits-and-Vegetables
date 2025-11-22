import express from 'express';
import { getCatalog, getProduct, getPublicVendorProducts } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getCatalog);
router.get('/vendor-products', getPublicVendorProducts);
router.get('/:id', getProduct);

export default router;

