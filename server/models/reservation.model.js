export default (sequelize, DataTypes) => {
  const Reservation = sequelize.define('Reservation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Format: HH:MM'
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Format: HH:MM'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      comment: 'Duration in minutes (multiples of 10)'
    },
    isAutomatic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'used', 'cancelled'),
      defaultValue: 'scheduled'
    }
  }, {
    timestamps: true,
    tableName: 'reservations'
  });

  Reservation.associate = (models) => {
    Reservation.belongsTo(models.Client, {
      foreignKey: 'clientId',
      as: 'client'
    });
    
    Reservation.belongsTo(models.Dock, {
      foreignKey: 'dockId',
      as: 'dock'
    });
  };

  return Reservation;
};