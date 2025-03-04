import express from 'express';
import { 
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';
import { verifyToken, isOperatorOrAdmin, isAdmin, isSameCompany } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes for operators and admins
router.get('/', isOperatorOrAdmin, getAllProducts);
router.get('/:id', isOperatorOrAdmin, isSameCompany, getProductById);

// Routes for admins only
router.post('/', isAdmin, createProduct);
router.put('/:id', isAdmin, isSameCompany, updateProduct);
router.delete('/:id', isAdmin, isSameCompany, deleteProduct);

export default router;