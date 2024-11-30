const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Trip = sequelize.define('Trip', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        idNumber: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        gender: { type: DataTypes.STRING, allowNull: false },
        customerType: { type: DataTypes.STRING, allowNull: false },
        startTime: { type: DataTypes.DATE, allowNull: false },
        endTime: { type: DataTypes.DATE, allowNull: false },
        duration: { type: DataTypes.FLOAT, allowNull: false },
        cost: { type: DataTypes.FLOAT, allowNull: false },
        tripStatus: { type: DataTypes.STRING, allowNull: false },
        synced: { type: DataTypes.BOOLEAN, allowNull: false },
        createdBy: { type: DataTypes.INTEGER },
        updatedBy: { type: DataTypes.INTEGER }
    }, {
        timestamps: true, // Enables `createdAt` and `updatedAt`
        hooks: {
            beforeCreate: (trip, options) => {
                if (options.user) trip.createdBy = options.user.id;
            },
            beforeUpdate: (trip, options) => {
                if (options.user) trip.updatedBy = options.user.id;
            }
        }
    });

    // Add scopes after defining the model
    Trip.addScope('withCreator', {
        include: [
            {
                model: sequelize.models.User,
                as: 'creator',
                attributes: ['id', 'username']
            }
        ]
    });

    Trip.addScope('withUpdator', {
        include: [
            {
                model: sequelize.models.User,
                as: 'updater',
                attributes: ['id', 'username']
            }
        ]
    });


    Trip.associate = (models) => {
        Trip.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
        Trip.belongsTo(models.User, { foreignKey: 'updatedBy', as: 'updater' });
    };

    return Trip;
};
