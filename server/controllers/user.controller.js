import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const { User, Company } = db;

// Get all users (with pagination and filtering)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, companyId, active } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where clause for filtering
    const where = {};
    
    if (search) {
      where[db.Sequelize.Op.or] = [
        { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { email: { [db.Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (companyId) {
      where.companyId = companyId;
    } else if (req.user.role !== 'admin') {
      // Non-admin users can only see users from their company
      where.companyId = req.user.companyId;
    }
    
    if (active !== undefined) {
      where.active = active === 'true';
    }
    
    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
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
      users,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has permission to view this user
    if (req.user.role !== 'admin' && user.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied: user belongs to another company' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, companyId, discountLimit, active } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Check if company exists
    if (companyId) {
      const company = await Company.findByPk(companyId);
      if (!company) {
        return res.status(400).json({ message: 'Company not found' });
      }
      
      // Check if user has permission to create user for this company
      if (req.user.role !== 'admin' && companyId !== req.user.companyId) {
        return res.status(403).json({ message: 'Access denied: cannot create user for another company' });
      }
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'operator',
      companyId: companyId || req.user.companyId,
      discountLimit: discountLimit || 0,
      active: active !== undefined ? active : true
    });
    
    // Return user data (excluding password)
    const userData = { ...newUser.toJSON() };
    delete userData.password;
    
    res.status(201).json({
      message: 'User created successfully',
      user: userData
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, companyId, discountLimit, active } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has permission to update this user
    if (req.user.role !== 'admin' && user.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied: user belongs to another company' });
    }
    
    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Check if company is being changed and if it exists
    if (companyId && companyId !== user.companyId) {
      const company = await Company.findByPk(companyId);
      if (!company) {
        return res.status(400).json({ message: 'Company not found' });
      }
      
      // Only admins can change company
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: only admins can change company' });
      }
    }
    
    // Update user
    await user.update({
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      companyId: companyId || user.companyId,
      discountLimit: discountLimit !== undefined ? discountLimit : user.discountLimit,
      active: active !== undefined ? active : user.active
    });
    
    // Get updated user with company
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has permission to delete this user
    if (req.user.role !== 'admin' && user.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied: user belongs to another company' });
    }
    
    // Prevent self-deletion
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Soft delete user
    await user.destroy();
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Reset user password
export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has permission to reset this user's password
    if (req.user.role !== 'admin' && user.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied: user belongs to another company' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await user.update({ password: hashedPassword });
    
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};