const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config(); // Load environment variables

const HERE_API_KEY = process.env.HERE_API_KEY;

// Handle geocode requests
router.get('/geocode', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    try {
        const response = await axios.get('https://geocode.search.hereapi.com/v1/geocode', {
            params: {
                q: query,
                apiKey: HERE_API_KEY,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from HERE API:', error.message);
        res.status(500).json({ message: 'Failed to get geocode information' });
    }
});

module.exports = router;
