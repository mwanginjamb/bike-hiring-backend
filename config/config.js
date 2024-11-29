require('dotenv').config()

module.exports = {
  dev: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3308,
    dialect: 'mysql',
    dialectOptions: {

    }
  }
}