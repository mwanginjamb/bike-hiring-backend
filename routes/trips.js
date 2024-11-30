const express = require('express')
const { isAuthenticated } = require('../middleware/auth')
const logger = require('../utilities/logger')
const { Trip } = require('../models')

const router = express.Router();


router.post('/sync', isAuthenticated, async (req, res) => {
    try {

        const user = req.currentUser;
        logger.info(`Trip sync initiated ...`, {
            method: req.method,
            route: req.originalUrl,
            userId: user.id,
            username: user.username
        })


        const trips = req.body;
        const createdTrips = await Promise.all(
            trips.map(({ id, ...tripWithoutId }) => Trip.create(tripWithoutId, { req }))
        );

        // Log success

        logger.info(`Trip successfully synced by user `, {
            userID: user.id,
            username: user.username,
            syncedTripCount: createdTrips.length
        })

        res.status(201).json({ message: 'Trips synced successfully', trips: createdTrips });
    } catch (error) {
        // Log error details with the user context
        logger.error(`Error syncing trips`, {
            userId: req.currentUser?.user?.id || 'Unknown',
            username: req.currentUser?.user?.username || 'Unknown',
            error: error.message,
            stack: error.stack,
        });
        res.status(500).json({ message: 'Error syncing trips', error: error.message });
    }
});

router.get('/trips', async (req, res) => {
    try {
        const trips = await Trip.findAll({
            attributes: ['id', 'idNumber', 'name', 'gender', 'customerType', 'startTime', 'endTime', 'duration', 'cost']
        });
        res.json(trips);
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({ message: 'Error fetching trips', error: error.message });
    }
});


module.exports = router;