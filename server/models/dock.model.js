export default (sequelize, DataTypes) => {
  const Dock = sequelize.define('Dock', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    workingHoursStart: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '08:00',
      comment: 'Format: HH:MM'
    },
    workingHoursEnd: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '17:00',
      comment: 'Format: HH:MM'
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    blockReason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Soft delete
    tableName: 'docks'
  });

  Dock.associate = (models) => {
    Dock.belongsTo(models.Company, {
      foreignKey: 'companyId',
      as: 'company'
    });
    
    Dock.hasMany(models.Order, {
      foreignKey: 'dockId',
      as: 'orders'
    });
    
    Dock.hasMany(models.DockSchedule, {
      foreignKey: 'dockId',
      as: 'schedules'
    });
    
    Dock.hasMany(models.Reservation, {
      foreignKey: 'dockId',
      as: 'reservations'
    });
  };

  return Dock;
};