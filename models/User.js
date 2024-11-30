const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {

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

    return User;
};
