const mongoose = require('mongoose');

const CredibilityEventSchema = new mongoose.Schema({
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  },
  pointsDelta: {
    type: Number,
    required: [true, 'Please specify points delta']
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CredibilityEvent', CredibilityEventSchema);
