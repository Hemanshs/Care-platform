// routes/requests.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Request = require('../models/Request');
const User = require('../models/User');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');


// Create a new assistance request (Only for Seekers)
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, location, preferences } = req.body;

  try {
    // Check if the user is a seeker
    if (req.user.role !== 'seeker') {
      return res.status(403).json({ message: 'Only seekers are allowed to create requests.' });
    }

    // Create a new request with the provided details
    const request = new Request({
      requester: req.user._id,
      title,
      description,
      location,
      preferences,
      status: 'open',
    });

    await request.save();
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(400).json({ message: error.message });
  }
});

// View all requests specific to the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  // Parse query parameters and set default values
  const page = parseInt(req.query.page, 10) || 1;
  const maxLimit = 100;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, maxLimit);

  if (page < 1 || limit < 1) {
    return res.status(400).json({ message: 'Page and limit should be positive integers.' });
  }

  try {
    // Fetch requests with pagination
    const requests = await Request.find()
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const count = await Request.countDocuments();

    res.status(200).json({
      requests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching requests:', error.message);
    res.status(500).json({ message: 'Error fetching requests, please try again later.' });
  }
});


module.exports = router;
