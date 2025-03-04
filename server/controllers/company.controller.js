import db from '../models/index.js';
import { Op } from 'sequelize';

const Company = db.Company;

// Criar uma nova empresa
export const create = async (req, res) => {
  console.log('Controller: Recebida requisição para criar empresa:', req.body);
  try {
    // Validar dados obrigatórios
    if (!req.body.name || !req.body.document) {
      console.error('Controller: Dados obrigatórios faltando');
      return res.status(400).json({
        message: "Nome e documento são obrigatórios"
      });
    }

    const company = await Company.create({
      ...req.body,
      active: true // Empresa é criada como ativa por padrão
    });
    
    console.log('Controller: Empresa criada com sucesso:', company.toJSON());
    
    // Retornar apenas os dados necessários
    return res.status(201).json({
      id: company.id,
      name: company.name,
      document: company.document,
      address: company.address,
      phone: company.phone,
      email: company.email,
      active: company.active,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    });
  } catch (error) {
    console.error('Controller: Erro ao criar empresa:', error);
    return res.status(400).json({
      message: error.message || "Erro ao criar empresa"
    });
  }
};

// Buscar todas as empresas com paginação e filtros
export const findAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', active } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { document: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (active !== undefined) {
      where.active = active === 'true';
    }

    const { count, rows } = await Company.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    return res.json({
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      companies: rows
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Erro ao buscar empresas"
    });
  }
};

// Buscar uma empresa específica
export const findOne = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id, {
      include: ['users', 'products', 'clients', 'docks', 'holidays']
    });
    
    if (!company) {
      return res.status(404).json({
        message: "Empresa não encontrada"
      });
    }

    return res.json(company);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Erro ao buscar empresa"
    });
  }
};

// Atualizar uma empresa
export const update = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        message: "Empresa não encontrada"
      });
    }

    await company.update(req.body);
    return res.json(company);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Erro ao atualizar empresa"
    });
  }
};

// Deletar uma empresa (soft delete)
export const remove = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        message: "Empresa não encontrada"
      });
    }

    await company.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Erro ao deletar empresa"
    });
  }
};

// Alternar status ativo/inativo
export const toggleActive = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        message: "Empresa não encontrada"
      });
    }

    await company.update({ active: !company.active });
    return res.json(company);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Erro ao alterar status da empresa"
    });
  }
};
