import { db } from '../models/index.js';
import { Op } from 'sequelize';

const { Product, Company } = db;

// Get all products with pagination and filtering
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, companyId, active } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where clause for filtering
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (companyId) {
      where.companyId = companyId;
    } else if (req.user.role !== 'admin') {
      // Non-admin users can only see products from their company
      where.companyId = req.user.companyId;
    }
    
    if (active !== undefined) {
      where.active = active === 'true';
    }
    
    // Get products with pagination
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json({
      products,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    // Check if user has permission to view this product
    if (req.user.role !== 'admin' && product.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Acesso negado: produto pertence a outra empresa' });
    }
    
    res.status(200).json({ product });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Erro ao buscar produto', error: error.message });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, loadingTime, companyId, active } = req.body;
    
    // Validate required fields
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'Nome, preço e estoque são obrigatórios' });
    }
    
    // Check if company exists
    if (companyId) {
      const company = await Company.findByPk(companyId);
      if (!company) {
        return res.status(400).json({ message: 'Empresa não encontrada' });
      }
      
      // Check if user has permission to create product for this company
      if (req.user.role !== 'admin' && companyId !== req.user.companyId) {
        return res.status(403).json({ message: 'Acesso negado: não pode criar produto para outra empresa' });
      }
    }
    
    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      loadingTime: loadingTime || 10,
      companyId: companyId || req.user.companyId,
      active: active !== undefined ? active : true
    });
    
    // Return product with company
    const productWithCompany = await Product.findByPk(product.id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.status(201).json({
      message: 'Produto criado com sucesso',
      product: productWithCompany
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Erro ao criar produto', error: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, loadingTime, active } = req.body;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    // Check if user has permission to update this product
    if (req.user.role !== 'admin' && product.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Acesso negado: produto pertence a outra empresa' });
    }
    
    // Update product
    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? price : product.price,
      stock: stock !== undefined ? stock : product.stock,
      loadingTime: loadingTime !== undefined ? loadingTime : product.loadingTime,
      active: active !== undefined ? active : product.active
    });
    
    // Get updated product with company
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.status(200).json({
      message: 'Produto atualizado com sucesso',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Erro ao atualizar produto', error: error.message });
  }
};

// Delete product (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    // Check if user has permission to delete this product
    if (req.user.role !== 'admin' && product.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Acesso negado: produto pertence a outra empresa' });
    }
    
    await product.destroy();
    
    res.status(200).json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Erro ao excluir produto', error: error.message });
  }
};

