'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Pega todos os pedidos que não têm número
    const orders = await queryInterface.sequelize.query(
      'SELECT id FROM orders WHERE "orderNumber" IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Atualiza cada pedido com um número único
    for (const order of orders) {
      const timestamp = new Date().getTime();
      await queryInterface.sequelize.query(
        'UPDATE orders SET "orderNumber" = :orderNumber WHERE id = :id',
        {
          replacements: { 
            orderNumber: `ORD-${timestamp}`,
            id: order.id 
          },
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Não é necessário desfazer esta migração
  }
};
