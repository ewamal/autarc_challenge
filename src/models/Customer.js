const { DataTypes, Model } = require('sequelize');

class Customer extends Model {
  /**
   * Initialize the Customer model.
   * @param {Sequelize} sequelize - The Sequelize instance.
   */
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Name cannot be empty' },
          },
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: { msg: 'Must be a valid email address' },
            notEmpty: { msg: 'Email cannot be empty' },
          },
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            isNumeric: { msg: 'Phone must contain only numbers' },
          },
        },

      },
      {
        sequelize,
        modelName: 'Customer',
        tableName: 'customers',
        timestamps: true,
      }
    );
  }
}

module.exports = Customer;
