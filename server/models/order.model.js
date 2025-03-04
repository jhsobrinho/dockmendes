export default (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Número do pedido para exibição'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estimatedTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      comment: 'Estimated time in minutes for loading/unloading'
    },
    transportCompany: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Nome da transportadora (pode ser diferente do cliente)'
    },
    driverName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Nome do motorista para este pedido'
    },
    vehiclePlate: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Placa do veículo para este pedido'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true,
    tableName: 'orders',
    hooks: {
      beforeCreate: async (order) => {
        if (!order.orderNumber) {
          const timestamp = new Date().getTime();
          order.orderNumber = `ORD-${timestamp}`;
        }
      }
    }
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Order.belongsTo(models.Client, {
      foreignKey: 'clientId',
      as: 'client'
    });
    
    Order.belongsTo(models.Dock, {
      foreignKey: 'dockId',
      as: 'dock'
    });
    
    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'items'
    });
    
    Order.hasOne(models.DockSchedule, {
      foreignKey: 'orderId',
      as: 'schedule'
    });
  };

  return Order;
};