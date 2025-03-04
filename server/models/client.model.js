export default (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    document: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    isLoyal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Flag for loyal clients'
    },
    quotas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Available quotas in minutes (multiples of 10)'
    },
    autoReserve: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Flag for automatic reservation'
    },
    preferredDays: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Days of the week for automatic reservation'
    },
    preferredTime: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Preferred time for reservation'
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Soft delete
    tableName: 'clients'
  });

  Client.associate = (models) => {
    Client.belongsTo(models.Company, {
      foreignKey: 'companyId',
      as: 'company'
    });
    
    Client.hasMany(models.Order, {
      foreignKey: 'clientId',
      as: 'orders'
    });
    
    Client.hasMany(models.Reservation, {
      foreignKey: 'clientId',
      as: 'reservations'
    });
  };

  return Client;
};