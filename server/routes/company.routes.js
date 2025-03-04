import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Placeholder for company routes
router.get('/', isAdmin, (req, res) => {
  res.status(200).json({ message: 'Company routes will be implemented here' });
});

export default router;