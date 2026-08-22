import mongoose from "mongoose";

const industryProposalSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },

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

    industryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Industry",
      required: [true, "Industry ID is required"],
    },

    offeringType: {
      type: String,
      enum: [
        "funding",
        "technology",
        "equipment",
        "services",
        "mentorship",
        "other",
      ],
      required: [true, "Offering type is required"],
    },

    title: {
      type: String,
      required: [true, "Proposal title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Proposal description is required"],
      trim: true,
    },

    resourcesOffered: {
      type: String,
      trim: true,
    },

    estimatedValue: {
      type: Number,
      min: [0, "Estimated value cannot be negative"],
    },

    timeline: {
      type: String,
      trim: true,
    },

    proposalDocument: {
      url: { type: String },
      publicId: { type: String },
      originalName: { type: String },
    },

    status: {
      type: String,
      enum: ["submitted", "accepted", "rejected", "revision_requested"],
      default: "submitted",
    },

    universityResponse: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UniversityUser",
      },
      reviewedAt: { type: Date },
      notes: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

industryProposalSchema.index({ projectId: 1, industryId: 1 });
industryProposalSchema.index({ universityId: 1, status: 1 });

const IndustryProposal = mongoose.model(
  "IndustryProposal",
  industryProposalSchema
);

export default IndustryProposal;
