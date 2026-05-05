const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },

  // 🔥 NEW FIELDS
  deviceName: {
    type: String, // e.g. "My Laptop", "Rahul's Phone"
    default: "Unknown Device"
  },
  deviceType: {
    type: String, // mobile / desktop / tablet
  },
  os: {
    type: String, // Windows / Android / iOS / macOS
  },

  expiresAt: {
    type: Date,
    required: true,
  },
  revoked: {
    type: Boolean,
    default: false,
  },
  count: {
    type: Number,
    default: 1
  }

}, {
  timestamps: true,
});

module.exports = mongoose.model('Session', sessionSchema);