import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  createShoppingList,
  getShoppingLists,
  getShoppingList,
  addItemToShoppingList,
  removeItemFromShoppingList,
  deleteShoppingList
} from '../controllers/buyerController.js';
import {
  getMatchingProducts,
  saveSelection
} from '../controllers/matchingController.js';
import {
  getCheckoutSummary,
  completeCheckout
} from '../controllers/checkoutController.js';

const router = express.Router();

// All buyer routes require authentication and buyer role
router.use(authenticate);
router.use(requireRole('buyer'));

// Shopping Lists
router.post('/shopping-lists', createShoppingList);
router.get('/shopping-lists', getShoppingLists);
router.get('/shopping-lists/:id', getShoppingList);
router.delete('/shopping-lists/:id', deleteShoppingList);

// Shopping List Items
router.post('/shopping-lists/:id/items', addItemToShoppingList);
router.delete('/shopping-lists/:id/items/:itemId', removeItemFromShoppingList);

// Matching & Selection
router.get('/shopping-list-items/:itemId/matching', getMatchingProducts);
router.post('/shopping-list-items/:itemId/select', saveSelection);

// Checkout
router.get('/shopping-lists/:id/checkout', getCheckoutSummary);
router.post('/shopping-lists/:id/checkout', completeCheckout);

export default router;

