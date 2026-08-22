const mongoose = require('mongoose');

const EdgeCaseReviewSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  aiConfidence: {
    type: Number,
    required: true
  },
  aiReasoning: {
    type: String,
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  decision: {
    type: String,
    enum: ['approve', 'reject', 'merge', 'request-info']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EdgeCaseReview', EdgeCaseReviewSchema);
