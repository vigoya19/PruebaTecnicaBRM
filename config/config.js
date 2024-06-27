require('dotenv').config();

module.exports = {
  development: {
    username: process.env.MYSQL_USER || 'user',
    password: process.env.MYSQL_PASSWORD || 'sinitiswasif123',
    database: process.env.MYSQL_DATABASE || 'inventario_db',
    host: process.env.MYSQL_HOST || 'mysql',
    dialect: 'mysql',
  },
  test: {
    username: process.env.MYSQL_USER || 'user',
    password: process.env.MYSQL_PASSWORD || 'sinitiswasif123',
    database: process.env.MYSQL_DATABASE || 'inventario_db_test',
    host: process.env.MYSQL_HOST || 'mysql',
    dialect: 'mysql',
  },
  production: {
    username: process.env.MYSQL_USER || 'user',
    password: process.env.MYSQL_PASSWORD || 'sinitiswasif123',
    database: process.env.MYSQL_DATABASE || 'inventario_db',
    host: process.env.MYSQL_HOST || 'mysql',
    dialect: 'mysql',
  },
};
