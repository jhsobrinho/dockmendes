import express from 'express';
import { verifyToken, isOperatorOrAdmin } from '../middleware/auth.middleware.js';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  toggleClientStatus
} from '../controllers/client.controller.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Client routes
router.get('/', isOperatorOrAdmin, getAllClients);
router.get('/:id', isOperatorOrAdmin, getClientById);
router.post('/', isOperatorOrAdmin, createClient);
router.put('/:id', isOperatorOrAdmin, updateClient);
router.delete('/:id', isOperatorOrAdmin, deleteClient);
router.patch('/:id', isOperatorOrAdmin, toggleClientStatus);

export { router as default };