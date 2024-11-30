const { Sequelize } = require('sequelize')
const TripModel = require('./Trip')
const UserModel = require('./User')
require('dotenv').config()


const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        port: process.env.DB_PORT || 3306,
        dialectOptions: {
            // Optional: Add any MariaDB-specific connection options
            // For example, SSL settings, connection timeout, etc.
            // ssl: { ... }
        },
        pool: {
            max: 5, // Maximum number of connection in pool
            min: 0, // Minimum number of connection in pool
            acquire: 30000, // Maximum time to acquire a connection
            idle: 10000 // Connection can be idle before being released
        }
    }
);


const models = {
    Trip: TripModel(sequelize),
    User: UserModel(sequelize)
}

function configureBlameable(sequelize) {
    // Add  a global hook to all models
    sequelize.addHook('beforeCreate', (instance, options) => {
        if (options.req && options.req.currentUser) {
            instance.createdBy = options.req.currentUser.id
        }
    });

    sequelize.addHook('beforeUpdate', (instance, options) => {
        if (options.req && options.req.currentUser) {
            instance.updatedBy = options.req.currentUser.id
        }
    });
}

module.exports = { sequelize, ...models, configureBlameable };