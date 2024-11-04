const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../services/emailService');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
// Registration route (Initiates email verification)
router.post('/register', async (req, res) => {
  const { name, email, phoneNo, location, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {

          return res.status(409).json({ error: "User already exists", message: "Email already taken" }); 

        }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      phoneNo,
      location,
      password: hashedPassword,
      role,
      isVerified: false,
      preferences,
    });
    await user.save();

    // Create a verification token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Send email using Resend
    const mailOptions = {
      from: process.env.EMAIL_SENDER, // Your verified email
      to: email, // User's email
      subject: 'Verify Your Email Address',
      html: `
        <p>Hello ${name},</p>
        <p>Thank you for registering with our care platform. Please verify your email by clicking the link below:</p>
        <a href="http://localhost:5001/api/auth/verify-email?token=${token}">Verify Email</a>
        <p>If you did not create this account, you can ignore this email.</p>
        <p>Best regards,<br/>Care Platform Team</p>
      `,
    };

    await sendEmail(mailOptions);

    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Email verification route
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    // Redirect to the frontend login page or success page
    res.redirect('http://localhost:3000/login?verified=true');
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(400).send('<h1>Invalid or expired token</h1><p>Please try again.</p>');
  }
});
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <p>Hello ${user.name},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="http://localhost:5001/api/auth/verify-email?token=${token}">Verify Email</a>
      `,
    };

    await sendEmail(mailOptions);

    res.status(200).json({ message: 'Verification email resent successfully.' });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ message: 'Error resending verification email.' });
  }
});


// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/preferences', authMiddleware, async (req, res) => {
  const { preferences } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update preferences based on user role
    if (user.role === 'seeker') {
      user.seekerPreferences = preferences;
    } else if (user.role === 'volunteer') {
      user.volunteerPreferences = preferences;
    }

    await user.save();
    res.status(200).json({ message: 'Preferences updated successfully', preferences: user.role === 'seeker' ? user.seekerPreferences : user.volunteerPreferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/me', authMiddleware, async (req, res) => {
  const { name, email, phoneNo, preferences } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phoneNo = phoneNo || user.phoneNo;
    user.preferences = preferences || user.preferences;

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // Exclude the password field from the response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field from the response
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
