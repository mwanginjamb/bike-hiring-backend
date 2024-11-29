const { Sequelize, DataTypes } = require('sequelize')
const bcrypt = require('bcrypt')
const path = require('path')
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

const Trip = sequelize.define('Trip', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customerType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    duration: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    cost: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    tripStatus: {
        type: DataTypes.STRING,
        allowNull: false
    },
    synced: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
});

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 25]
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [5, 30]
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('operator', 'admin'),
        allowNull: false
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpiration: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10)
                user.password = await bcrypt.hash(user.password, salt)
            }
        },
        beforeUpdate: async (user) => {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(user.password, salt)
        }
    }
})

// Instance method to validate password
User.prototype.validatePassword = function (password) {
    return bcrypt.compare(password, this.password)
}

// class method to find user by username

User.findByUsername = function (username) {
    return User.findOne({ where: { username } })
}

User.findByEmail = function (email) {
    return User.findOne({ where: { email } })
}

User.findByResetToken = function (token) {
    return User.findOne({
        where: {
            resetToken: token,
            resetTokenExpiration: { [Sequelize.Op.gt]: new Date() }
        }
    })
}

module.exports = { sequelize, Trip, User };