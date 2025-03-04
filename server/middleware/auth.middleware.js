import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const { User } = db;

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (!user.active) {
      return res.status(403).json({ message: 'User account is inactive' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Requires admin role' });
  }
};

export const isOperatorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'operator' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Requires operator or admin role' });
  }
};

export const isSameCompany = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const resourceType = req.baseUrl.split('/').pop();
    
    let resource;
    
    switch (resourceType) {
      case 'users':
        resource = await db.User.findByPk(resourceId);
        break;
      case 'products':
        resource = await db.Product.findByPk(resourceId);
        break;
      case 'clients':
        resource = await db.Client.findByPk(resourceId);
        break;
      case 'docks':
        resource = await db.Dock.findByPk(resourceId);
        break;
      default:
        return next();
    }
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    if (resource.companyId !== req.user.companyId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: resource belongs to another company' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking company access' });
  }
};