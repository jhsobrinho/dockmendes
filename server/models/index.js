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
    define: {
      freezeTableName: true,
      schema: 'public'
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
    }
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  }
};

// Sincronizar o banco de dados
const syncDatabase = async () => {
  try {
    console.log('Iniciando sincronização do banco de dados...');

    // Recria o schema e habilita a extensão uuid-ossp
    await sequelize.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await sequelize.query('CREATE SCHEMA public;');
    await sequelize.query('GRANT ALL ON SCHEMA public TO master;');
    await sequelize.query('GRANT ALL ON SCHEMA public TO public;');
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Aguarda um momento para garantir que o schema foi criado
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Sincroniza os modelos em ordem específica
    const models = [
      { model: db.Company, name: 'Company' },
      { model: db.User, name: 'User' },
      { model: db.Product, name: 'Product' },
      { model: db.Client, name: 'Client' },
      { model: db.Dock, name: 'Dock' },
      { model: db.Holiday, name: 'Holiday' },
      { model: db.Order, name: 'Order' },
      { model: db.OrderItem, name: 'OrderItem' },
      { model: db.DockSchedule, name: 'DockSchedule' },
      { model: db.Reservation, name: 'Reservation' }
    ];

    // Cria as tabelas em ordem
    for (const { model, name } of models) {
      console.log(`Sincronizando modelo ${name}...`);
      await model.sync({ force: true });
      console.log(`Modelo ${name} sincronizado com sucesso!`);
    }
    
    // Cria o usuário admin
    await createAdminUser();
    
    console.log('Banco de dados sincronizado com sucesso!');
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
    throw error;
  }
};

// Executar sincronização apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  syncDatabase().catch(error => {
    console.error('Falha na sincronização do banco de dados:', error);
    process.exit(1);
  });
}

export default db;