const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const sequelize = require('./config/database');


app.use(express.json());

app.get('/', (req, res) => {
  res.send('Autarc Backend API');
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    return sequelize.sync();
  })
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

});

module.exports = app;
