import express from 'express';
import { registerVendor, registerBuyer, login, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register/vendor', registerVendor);
router.post('/register/buyer', registerBuyer);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);

export default router;

