const sequelize = require("../config/database.js");
const Customer = require("./Customer");

const initDB = async () => {

  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    Customer.init(sequelize);

    await sequelize.sync({ alter: true }); 
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = { initDB };
