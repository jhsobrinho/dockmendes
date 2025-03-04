import { Op } from 'sequelize';
import models from '../models/index.js';

const { Order, OrderItem, Client, Product, User, Dock } = models;

export const orderController = {
  // Listar pedidos com filtros e paginação
  getOrders: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        startDate,
        endDate
      } = req.query;

      const offset = (page - 1) * limit;
      
      const where = {
        deletedAt: null,
        ...(status && { status }),
        ...(startDate && endDate && {
          scheduledDate: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        })
      };

      if (search) {
        where[Op.or] = [
          { '$client.name$': { [Op.iLike]: `%${search}%` } },
          { '$client.document$': { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'name', 'document']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          },
          {
            model: Dock,
            as: 'dock',
            attributes: ['id', 'name']
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price']
            }]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        orders: rows,
        total: count
      });
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      res.status(500).json({ error: 'Erro ao listar pedidos' });
    }
  },

  // Buscar pedido por ID
  getOrderById: async (req, res) => {
    try {
      const order = await Order.findOne({
        where: {
          id: req.params.id,
          deletedAt: null
        },
        include: [
          {
            model: Client,
            as: 'client'
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          },
          {
            model: Dock,
            as: 'dock'
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product'
            }]
          }
        ]
      });

      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      res.json(order);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      res.status(500).json({ error: 'Erro ao buscar pedido' });
    }
  },

  // Criar novo pedido
  createOrder: async (req, res) => {
    try {
      const {
        clientId,
        items,
        scheduledDate,
        dockId,
        estimatedTime,
        notes
      } = req.body;

      // Calcular totais
      let totalAmount = 0;
      let totalDiscount = 0;

      // Criar pedido
      const order = await Order.create({
        clientId,
        userId: req.user.id,
        scheduledDate,
        dockId,
        estimatedTime,
        notes,
        status: 'pending',
        totalAmount,
        totalDiscount
      });

      // Criar itens do pedido
      if (items && items.length > 0) {
        const orderItems = await Promise.all(
          items.map(async (item) => {
            const product = await Product.findByPk(item.productId);
            if (!product) {
              throw new Error(`Produto ${item.productId} não encontrado`);
            }

            const total = product.price * item.quantity;
            totalAmount += total;
            totalDiscount += item.discount || 0;

            return OrderItem.create({
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
              discount: item.discount || 0,
              total
            });
          })
        );

        // Atualizar totais do pedido
        await order.update({
          totalAmount,
          totalDiscount
        });

        order.items = orderItems;
      }

      // Retornar pedido completo
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: Client,
            as: 'client'
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          },
          {
            model: Dock,
            as: 'dock'
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product'
            }]
          }
        ]
      });

      res.status(201).json(completeOrder);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      res.status(500).json({ error: 'Erro ao criar pedido' });
    }
  },

  // Atualizar pedido
  updateOrder: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      const {
        scheduledDate,
        dockId,
        estimatedTime,
        notes
      } = req.body;

      await order.update({
        scheduledDate,
        dockId,
        estimatedTime,
        notes
      });

      // Retornar pedido atualizado
      const updatedOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: Client,
            as: 'client'
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          },
          {
            model: Dock,
            as: 'dock'
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product'
            }]
          }
        ]
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      res.status(500).json({ error: 'Erro ao atualizar pedido' });
    }
  },

  // Excluir pedido (soft delete)
  deleteOrder: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      await order.destroy(); // Soft delete
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      res.status(500).json({ error: 'Erro ao excluir pedido' });
    }
  },

  // Atualizar status do pedido
  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findByPk(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      await order.update({ status });

      // Retornar pedido atualizado
      const updatedOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: Client,
            as: 'client'
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          },
          {
            model: Dock,
            as: 'dock'
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product'
            }]
          }
        ]
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      res.status(500).json({ error: 'Erro ao atualizar status do pedido' });
    }
  }
};
