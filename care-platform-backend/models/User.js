// User.js (User model)
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNo: { type: String, required: true, unique: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'volunteer'], required: true },
  verificationToken: { type: String },
  isVerified: { type: Boolean, default: false },
  availability: [
    {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
      },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
  emergencycontact: [{ name: { type: String, required: true } }],
  profilepicture: {
    type: Buffer,
    required: false,
  },
  preferences: [{
    type: String,
  }],
  skills: [String],
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request' }],
});

// Ensure geospatial indexing
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
