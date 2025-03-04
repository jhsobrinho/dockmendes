import express from 'express';
import { verifyToken, isOperatorOrAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Placeholder for reservation routes
router.get('/', isOperatorOrAdmin, (req, res) => {
  res.status(200).json({ message: 'Reservation routes will be implemented here' });
});

export default router;