export async function up(queryInterface, Sequelize) {
  // Adicionar campos na tabela orders
  await queryInterface.addColumn('orders', 'orderNumber', {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    comment: 'Número do pedido para exibição'
  });

  await queryInterface.addColumn('orders', 'transportCompany', {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'Nome da transportadora (pode ser diferente do cliente)'
  });

  await queryInterface.addColumn('orders', 'driverName', {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'Nome do motorista para este pedido'
  });

  await queryInterface.addColumn('orders', 'vehiclePlate', {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'Placa do veículo para este pedido'
  });
}

export async function down(queryInterface, Sequelize) {
  // Remover campos da tabela orders
  await queryInterface.removeColumn('orders', 'orderNumber');
  await queryInterface.removeColumn('orders', 'transportCompany');
  await queryInterface.removeColumn('orders', 'driverName');
  await queryInterface.removeColumn('orders', 'vehiclePlate');
}
