const { Sequalize, DataTypes } = require('sequalize')

const sequalize = new Sequalize({
    dialect: 'sqlite',
    storage: './database.sqlite'
})

const Trip = sequalize.define('Trip', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    customerType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.Date,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.Date,
        allowNull: false,
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

module.exports = { sequalize, Trip };