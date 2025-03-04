import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import {
  create,
  findAll,
  findOne,
  update,
  remove,
  toggleActive
} from '../controllers/company.controller.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(verifyToken);

// Rotas que requerem privilégios de admin
router.post('/', isAdmin, create);
router.put('/:id', isAdmin, update);
router.delete('/:id', isAdmin, remove);
router.patch('/:id/toggle-active', isAdmin, toggleActive);

// Rotas públicas (para usuários autenticados)
router.get('/', findAll);
router.get('/:id', findOne);

export default router;