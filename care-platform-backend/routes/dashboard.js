const express = require('express');
const User = require('../models/User');
const Request = require('../models/Request');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get Profile Information
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile Information
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phoneNo', 'seekerPreferences', 'volunteerPreferences'];
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Validation error' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Get Requests for User (Seeker or Volunteer)
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('requests');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const limit = parseInt(req.query.limit) || 10; // Default limit is 10
    const skip = parseInt(req.query.skip) || 0;

    let requests = [];
    if (user.role === 'seeker') {
      requests = await Request.find({ requester: user._id }).limit(limit).skip(skip);
    } else if (user.role === 'volunteer') {
      requests = await Request.find({ volunteer: user._id }).limit(limit).skip(skip);
    }

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Preferences (Seeker or Volunteer)
router.put('/preferences', authMiddleware, async (req, res) => {
  const { preferences } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'seeker') {
      user.seekerPreferences = preferences;
    } else if (user.role === 'volunteer') {
      user.volunteerPreferences = preferences;
    }

    await user.save();
    res.status(200).json({
      message: 'Preferences updated successfully',
      preferences: user.role === 'seeker' ? user.seekerPreferences : user.volunteerPreferences,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Get Dashboard Summary
router.get('/summary', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const totalRequests = await Request.countDocuments({ requester: user._id });
      const pendingRequests = await Request.countDocuments({ requester: user._id, status: 'pending' });
      const completedRequests = await Request.countDocuments({ requester: user._id, status: 'completed' });
  
      res.status(200).json({ totalRequests, pendingRequests, completedRequests });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get Notifications for User
  router.get('/notifications', authMiddleware, async (req, res) => {
    try {
      const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
module.exports = router;
