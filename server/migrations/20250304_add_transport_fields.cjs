'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const describeClients = await queryInterface.describeTable('clients');
    const describeOrders = await queryInterface.describeTable('orders');

    // Adicionar campos na tabela clients se não existirem
    if (!describeClients.transportCompany) {
      await queryInterface.addColumn('clients', 'transportCompany', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nome da transportadora'
      });
    }

    if (!describeClients.driverName) {
      await queryInterface.addColumn('clients', 'driverName', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nome do motorista'
      });
    }

    if (!describeClients.vehiclePlate) {
      await queryInterface.addColumn('clients', 'vehiclePlate', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Placa do veículo'
      });
    }

    // Adicionar campos na tabela orders
    if (!describeOrders.orderNumber) {
      // 1. Primeiro adiciona o campo permitindo nulos
      await queryInterface.addColumn('orders', 'orderNumber', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Número do pedido para exibição'
      });

      // 2. Atualiza os registros existentes com um número baseado no ID
      await queryInterface.sequelize.query(`
        UPDATE orders 
        SET "orderNumber" = CONCAT('ORD-', id)
        WHERE "orderNumber" IS NULL;
      `);

      // 3. Altera a coluna para não permitir nulos e ser única
      await queryInterface.changeColumn('orders', 'orderNumber', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Número do pedido para exibição'
      });
    }

    if (!describeOrders.transportCompany) {
      await queryInterface.addColumn('orders', 'transportCompany', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nome da transportadora (pode ser diferente do cliente)'
      });
    }

    if (!describeOrders.driverName) {
      await queryInterface.addColumn('orders', 'driverName', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nome do motorista para este pedido'
      });
    }

    if (!describeOrders.vehiclePlate) {
      await queryInterface.addColumn('orders', 'vehiclePlate', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Placa do veículo para este pedido'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remover campos da tabela clients
    await queryInterface.removeColumn('clients', 'transportCompany');
    await queryInterface.removeColumn('clients', 'driverName');
    await queryInterface.removeColumn('clients', 'vehiclePlate');

    // Remover campos da tabela orders
    await queryInterface.removeColumn('orders', 'orderNumber');
    await queryInterface.removeColumn('orders', 'transportCompany');
    await queryInterface.removeColumn('orders', 'driverName');
    await queryInterface.removeColumn('orders', 'vehiclePlate');
  }
};
