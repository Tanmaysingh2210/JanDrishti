const mongoose = require('mongoose');

const IndustryProposalSchema = new mongoose.Schema({
  industryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  fundingOffer: {
    type: Number,
    required: [true, 'Please specify the funding amount']
  },
  supportType: {
    type: String,
    required: [true, 'Please specify type of support']
  },
  status: {
    type: String,
    enum: ['submitted', 'selected', 'rejected'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('IndustryProposal', IndustryProposalSchema);
