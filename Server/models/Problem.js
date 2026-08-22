const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  media: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  status: {
    type: String,
    enum: [
      'submitted',
      'ai-validated',
      'edge-case',
      'approved',
      'rejected',
      'merged',
      'open-for-proposals',
      'assigned',
      'in-progress',
      'completed'
    ],
    default: 'submitted'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedUniversity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  selectedIndustry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Problem', ProblemSchema);
