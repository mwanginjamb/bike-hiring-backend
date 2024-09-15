const express = require('express')
const { Trip } = require('../models')

const router = express.Router();


router.post('/sync', async (req, res) => {
    try {
        const trips = req.body;
        const createdTrips = await Promise.all(
            trips.map(trip => Trip.create(trip))
        );
        res.status(201).json({ message: 'Trips synced successfully', trips: createdTrips });
    } catch (error) {
        console.error('Error syncing trips:', error);
        res.status(500).json({ message: 'Error syncing trips', error: error.message });
    }
});

router.get('/trips', async (req, res) => {
    try {
        const trips = await Trip.findAll();
        res.json(trips);
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({ message: 'Error fetching trips', error: error.message });
    }
});

module.exports = router;