const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],
  });
module.exports = mongoose.model('Chat', ChatSchema);
