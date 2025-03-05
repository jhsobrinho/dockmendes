'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop todos os tipos existentes
    await queryInterface.sequelize.query(`
      DO $$
      DECLARE 
        r RECORD;
      BEGIN
        FOR r IN (
          SELECT t.typname
          FROM pg_type t
          JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'public'
          AND t.typtype = 'e'
        )
        LOOP
          EXECUTE 'DROP TYPE IF EXISTS "' || r.typname || '" CASCADE';
        END LOOP;
      END $$;
    `);

    // Recriar o enum de status do pedido
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_orders_status" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
    `);

    // Recriar o enum de role do usuário
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_role" AS ENUM ('admin', 'manager', 'operator');
    `);
  },

  async down(queryInterface, Sequelize) {
    // Não é necessário desfazer esta migração
  }
};
