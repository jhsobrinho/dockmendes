import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// Import models
import userModel from './user.model.js';
import companyModel from './company.model.js';
import productModel from './product.model.js';
import clientModel from './client.model.js';
import orderModel from './order.model.js';
import orderItemModel from './orderItem.model.js';
import dockModel from './dock.model.js';
import dockScheduleModel from './dockSchedule.model.js';
import holidayModel from './holiday.model.js';
import reservationModel from './reservation.model.js';

// Load environment variables from parent directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3
    },
    dialectOptions: {
      connectTimeout: 10000
    }
  }
);

// Initialize models
const db = {
  Sequelize,
  sequelize,
  User: userModel(sequelize, Sequelize),
  Company: companyModel(sequelize, Sequelize),
  Product: productModel(sequelize, Sequelize),
  Client: clientModel(sequelize, Sequelize),
  Order: orderModel(sequelize, Sequelize),
  OrderItem: orderItemModel(sequelize, Sequelize),
  Dock: dockModel(sequelize, Sequelize),
  DockSchedule: dockScheduleModel(sequelize, Sequelize),
  Holiday: holidayModel(sequelize, Sequelize),
  Reservation: reservationModel(sequelize, Sequelize)
};

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Test connection and log configuration
console.log('Tentando conectar ao banco de dados com as seguintes configurações:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Porta: ${process.env.DB_PORT}`);
console.log(`Banco: ${process.env.DB_NAME}`);
console.log(`Usuário: ${process.env.DB_USER}`);

// Criar usuário admin se não existir
const createAdminUser = async () => {
  try {
    const adminExists = await db.User.findOne({ where: { email: 'admin@admin.com' } });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await db.User.create({
        name: 'Administrador',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
        active: true
      });
      
      console.log('Usuário admin criado com sucesso!');
      console.log('Email: admin@admin.com');
      console.log('Senha: admin123');
    }
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  }
};

// Executar criação do admin após sincronizar o banco
sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => createAdminUser())
  .catch(error => console.error('Erro na sincronização:', error));

export default db;