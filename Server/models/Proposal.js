const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  approach: {
    type: String,
    required: [true, 'Please outline your approach']
  },
  timeline: {
    type: String,
    required: [true, 'Please specify the timeline']
  },
  costEstimate: {
    type: Number,
    required: [true, 'Please provide a cost estimate']
  },
  status: {
    type: String,
    enum: ['submitted', 'selected', 'rejected'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Proposal', ProposalSchema);
