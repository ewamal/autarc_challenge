const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const { initDB } = require('./models');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Autarc Backend API');
});
app.use("/api/customers", customerRoutes);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
