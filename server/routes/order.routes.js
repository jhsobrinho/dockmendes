import express from 'express';
import { verifyToken, isOperatorOrAdmin } from '../middleware/auth.middleware.js';
import { orderController } from '../controllers/order.controller.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(verifyToken);

// Listar pedidos
router.get('/', isOperatorOrAdmin, orderController.getOrders);

// Buscar pedido por ID
router.get('/:id', isOperatorOrAdmin, orderController.getOrderById);

// Criar novo pedido
router.post('/', isOperatorOrAdmin, orderController.createOrder);

// Atualizar pedido
router.put('/:id', isOperatorOrAdmin, orderController.updateOrder);

// Excluir pedido
router.delete('/:id', isOperatorOrAdmin, orderController.deleteOrder);

// Atualizar status do pedido
router.patch('/:id/status', isOperatorOrAdmin, orderController.updateOrderStatus);

export default router;