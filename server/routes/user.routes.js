import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  resetPassword
} from '../controllers/user.controller.js';
import { verifyToken, isAdmin, isOperatorOrAdmin, isSameCompany } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes for all authenticated users
router.get('/profile', (req, res) => res.json({ user: req.user }));

// Routes for admins and operators
router.get('/', isOperatorOrAdmin, getAllUsers);
router.get('/:id', isOperatorOrAdmin, isSameCompany, getUserById);

// Routes for admins only
router.post('/', isAdmin, createUser);
router.put('/:id', isAdmin, isSameCompany, updateUser);
router.delete('/:id', isAdmin, isSameCompany, deleteUser);
router.post('/:id/reset-password', isAdmin, isSameCompany, resetPassword);

export default router;