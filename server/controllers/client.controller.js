import db from '../models/index.js';
import { Op } from 'sequelize';

const Client = db.Client;

// Get all clients with pagination and filters
export const getAllClients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      active,
      companyId
    } = req.query;

    const offset = (page - 1) * limit;
    
    const where = {
      ...(active !== undefined && { active: active === 'true' }),
      ...(companyId && { companyId }),
      ...(search && {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { document: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ]
      })
    };

    const { count, rows } = await Client.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: db.Company,
        as: 'company',
        attributes: ['id', 'name']
      }]
    });

    res.json({
      total: count,
      clients: rows
    });
  } catch (error) {
    console.error('Error getting clients:', error);
    res.status(500).json({ message: 'Erro ao buscar clientes' });
  }
};

// Get client by ID
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [{
        model: db.Company,
        as: 'company',
        attributes: ['id', 'name']
      }]
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error getting client:', error);
    res.status(500).json({ message: 'Erro ao buscar cliente' });
  }
};

// Create new client
export const createClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Erro ao criar cliente' });
  }
};

// Update client
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    await client.update(req.body);
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Erro ao atualizar cliente' });
  }
};

// Delete client (soft delete)
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    await client.destroy();
    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Erro ao excluir cliente' });
  }
};

// Toggle client status
export const toggleClientStatus = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    await client.update({ active: req.body.active });
    res.json(client);
  } catch (error) {
    console.error('Error toggling client status:', error);
    res.status(500).json({ message: 'Erro ao alterar status do cliente' });
  }
};
