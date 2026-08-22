const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please add a milestone description']
  },
  dueDate: {
    type: Date,
    required: [true, 'Please specify a due date']
  },
  completedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'delayed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Milestone', MilestoneSchema);
