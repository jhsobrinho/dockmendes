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
      schema: 'public',
      timestamps: true,
      paranoid: true
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

// Sincronizar o banco de dados apenas se necessário
export async function initializeDatabase() {
  try {
    // Tenta conectar ao banco
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    console.log('Iniciando sincronização do banco de dados...');

    // Drop tipos enum existentes
    await sequelize.query(`
      DO $$
      BEGIN
        DROP TYPE IF EXISTS "enum_users_role" CASCADE;
        DROP TYPE IF EXISTS "enum_orders_status" CASCADE;
      EXCEPTION
        WHEN others THEN null;
      END $$;
    `);

    // Criar tipos enum
    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
          CREATE TYPE "enum_users_role" AS ENUM ('admin', 'manager', 'operator');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_status') THEN
          CREATE TYPE "enum_orders_status" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
        END IF;
      END
      $$;
    `);
    
    // Força a recriação de todas as tabelas
    await sequelize.sync({ force: true });
    
    console.log('Banco de dados sincronizado com sucesso.');
    
    // Cria o usuário admin se não existir
    await createAdminUser();
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  }
}

// Executar inicialização apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  initializeDatabase().catch(error => {
    console.error('Falha na inicialização do banco de dados:', error);
    process.exit(1);
  });
}

export default db;