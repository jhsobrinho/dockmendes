export default (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
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
      allowNull: false,
      unique: true
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
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Soft delete
    tableName: 'companies'
  });

  Company.associate = (models) => {
    Company.hasMany(models.User, {
      foreignKey: 'companyId',
      as: 'users'
    });
    
    Company.hasMany(models.Product, {
      foreignKey: 'companyId',
      as: 'products'
    });
    
    Company.hasMany(models.Client, {
      foreignKey: 'companyId',
      as: 'clients'
    });
    
    Company.hasMany(models.Dock, {
      foreignKey: 'companyId',
      as: 'docks'
    });
    
    Company.hasMany(models.Holiday, {
      foreignKey: 'companyId',
      as: 'holidays'
    });
  };

  return Company;
};