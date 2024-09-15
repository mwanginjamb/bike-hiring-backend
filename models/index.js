const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite')
});

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
    }
});

module.exports = { sequelize, Trip };