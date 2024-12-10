module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define('Customer', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      hubspotId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
    }, {
      tableName: 'customers',
      timestamps: false,
    });
  
    return Customer;
  };
  