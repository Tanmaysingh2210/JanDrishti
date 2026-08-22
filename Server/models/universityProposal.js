import mongoose from "mongoose";

const universityProposalSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "Issue ID is required"],
    },

    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: [true, "University ID is required"],
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UniversityUser",
      required: [true, "Submitted by user ID is required"],
    },

    title: {
      type: String,
      required: [true, "Proposal title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    solutionDescription: {
      type: String,
      required: [true, "Solution description is required"],
      trim: true,
    },

    teamInformation: [
      {
        name: { type: String, required: true, trim: true },
        role: { type: String, trim: true },
        email: { type: String, trim: true },
        designation: { type: String, trim: true },
      },
    ],

    facultyInformation: [
      {
        name: { type: String, required: true, trim: true },
        designation: { type: String, trim: true },
        department: { type: String, trim: true },
      },
    ],

    estimatedCost: {
      type: Number,
      required: [true, "Estimated cost is required"],
      min: [0, "Estimated cost cannot be negative"],
    },

    timelineMonths: {
      type: Number,
      required: [true, "Timeline duration (months) is required"],
      min: [1, "Timeline must be at least 1 month"],
    },

    proposalPdf: {
      url: { type: String },
      publicId: { type: String },
      originalName: { type: String },
    },

    status: {
      type: String,
      enum: ["submitted", "accepted", "rejected"],
      default: "submitted",
    },

    governmentReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GovernmentUser",
      },
      reviewedAt: { type: Date },
      notes: { type: String, trim: true },
      score: { type: Number, min: 0, max: 100 },
    },
  },
  {
    timestamps: true,
  }
);

universityProposalSchema.index({ issueId: 1, universityId: 1 });
universityProposalSchema.index({ status: 1 });

const UniversityProposal = mongoose.model(
  "UniversityProposal",
  universityProposalSchema
);

export default UniversityProposal;
