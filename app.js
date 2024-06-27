const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./user/route');
const productRoutes = require('./product/route');
const purchaseRoutes = require('./purchase/route');
const db = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const User = require('./user/model');
const Product = require('./product/model');
const Purchase = require('./purchase/model');
const PurchaseProduct = require('./purchaseProduct/model');

const app = express();

app.use(bodyParser.json());

app.use('/auth', userRoutes);
app.use('/products', productRoutes);
app.use('/purchases', purchaseRoutes);

app.use(errorHandler);

const models = { User, Product, Purchase, PurchaseProduct };
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

db.sync()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      logger.info('Server is running on port 3000');
    });
  })
  .catch((err) => {
    logger.info('Unable to connect to the database:', err);
  });

module.exports = app;
