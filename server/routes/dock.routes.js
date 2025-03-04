import express from 'express';
import { 
  getAllDocks, 
  getDockById, 
  createDock, 
  updateDock, 
  deleteDock,
  getDockSchedule,
  checkDockAvailability
} from '../controllers/dock.controller.js';
import { verifyToken, isOperatorOrAdmin, isSameCompany } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes for operators and admins
router.get('/', isOperatorOrAdmin, getAllDocks);
router.get('/:id', isOperatorOrAdmin, isSameCompany, getDockById);
router.post('/', isOperatorOrAdmin, createDock);
router.put('/:id', isOperatorOrAdmin, isSameCompany, updateDock);
router.delete('/:id', isOperatorOrAdmin, isSameCompany, deleteDock);

// Dock schedule routes
router.get('/:id/schedule', isOperatorOrAdmin, isSameCompany, getDockSchedule);
router.get('/:id/availability', isOperatorOrAdmin, isSameCompany, checkDockAvailability);

export default router;