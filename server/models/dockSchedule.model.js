export default (sequelize, DataTypes) => {
  const DockSchedule = sequelize.define('DockSchedule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'scheduled'
    }
  }, {
    timestamps: true,
    tableName: 'dock_schedules'
  });

  DockSchedule.associate = (models) => {
    DockSchedule.belongsTo(models.Dock, {
      foreignKey: 'dockId',
      as: 'dock'
    });
    
    DockSchedule.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'order'
    });
  };

  return DockSchedule;
};