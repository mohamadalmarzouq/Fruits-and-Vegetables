import express from 'express';
import { getCatalog, getProduct } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getCatalog);
router.get('/:id', getProduct);

export default router;

