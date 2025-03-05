-- Habilitar extensão uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tipos enum primeiro
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

-- Criar tabela companies
CREATE TABLE IF NOT EXISTS "companies" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "document" VARCHAR(255) NOT NULL UNIQUE,
  "address" VARCHAR(255),
  "phone" VARCHAR(255),
  "email" VARCHAR(255),
  "active" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP
);

-- Criar tabela users
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "role" enum_users_role DEFAULT 'operator',
  "discountLimit" INTEGER DEFAULT 0,
  "active" BOOLEAN DEFAULT true,
  "companyId" UUID REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP
);

-- Criar tabela clients
CREATE TABLE IF NOT EXISTS "clients" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "document" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "phone" VARCHAR(255),
  "address" VARCHAR(255),
  "transportCompany" VARCHAR(255),
  "driverName" VARCHAR(255),
  "vehiclePlate" VARCHAR(255),
  "active" BOOLEAN DEFAULT true,
  "companyId" UUID REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP
);

-- Criar tabela products
CREATE TABLE IF NOT EXISTS "products" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "loadingTime" INTEGER NOT NULL DEFAULT 10,
  "active" BOOLEAN DEFAULT true,
  "companyId" UUID REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP
);

-- Criar tabela docks
CREATE TABLE IF NOT EXISTS "docks" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "active" BOOLEAN DEFAULT true,
  "companyId" UUID REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP
);

-- Criar tabela orders
CREATE TABLE IF NOT EXISTS "orders" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "orderNumber" VARCHAR(255),
  "status" enum_orders_status DEFAULT 'pending',
  "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "totalDiscount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "scheduledDate" TIMESTAMP,
  "estimatedTime" INTEGER NOT NULL DEFAULT 30,
  "transportCompany" VARCHAR(255),
  "driverName" VARCHAR(255),
  "vehiclePlate" VARCHAR(255),
  "notes" TEXT,
  "userId" UUID REFERENCES "users"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  "clientId" UUID REFERENCES "clients"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  "dockId" UUID REFERENCES "docks"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  "companyId" UUID REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP
);

-- Criar tabela orderItems
CREATE TABLE IF NOT EXISTS "orderItems" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "orderId" UUID REFERENCES "orders"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  "productId" UUID REFERENCES "products"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP
);

-- Criar tabela dockSchedules
CREATE TABLE IF NOT EXISTS "dockSchedules" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "startTime" TIMESTAMP NOT NULL,
  "endTime" TIMESTAMP NOT NULL,
  "status" VARCHAR(255) DEFAULT 'scheduled',
  "notes" TEXT,
  "dockId" UUID REFERENCES "docks"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  "orderId" UUID REFERENCES "orders"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP
);

-- Criar tabela holidays
CREATE TABLE IF NOT EXISTS "holidays" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "date" TIMESTAMP NOT NULL,
  "description" TEXT,
  "active" BOOLEAN DEFAULT true,
  "companyId" UUID REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP
);

-- Criar tabela reservations
CREATE TABLE IF NOT EXISTS "reservations" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "startTime" TIMESTAMP NOT NULL,
  "endTime" TIMESTAMP NOT NULL,
  "status" VARCHAR(255) DEFAULT 'pending',
  "notes" TEXT,
  "dockId" UUID REFERENCES "docks"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  "companyId" UUID REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP
);
