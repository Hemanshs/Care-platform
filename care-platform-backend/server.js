require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Middleware to parse incoming requests
app.use(express.json());
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // Adjust this to match your frontend's address
  credentials: true
}));

// Load environment variables
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

// Ensure MONGO_URI is defined
if (!MONGO_URI) {
  console.error('MONGO_URI is not defined. Please check your .env file.');
  process.exit(1); // Stop the process if MONGO_URI is not set
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Serving static files from the frontend build
app.use(express.static(path.join(__dirname, '../care-platform-frontend/build')));

// API Routes (auth, requests, etc.)
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const dashboardRoutes = require('./routes/dashboard');
const locationHereRoutes = require('./services/locationHere'); 
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/services', locationHereRoutes);

// Catch-all to serve frontend for any unhandled route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../care-platform-frontend/build', 'index.html'), (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('An error occurred while trying to serve the requested page.');
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
