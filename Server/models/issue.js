import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: [true, "Citizen ID is required"],
    },

    title: {
      type: String,
      required: [true, "Issue title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Issue description is required"],
      trim: true,
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },

    category: {
      type: String,
      enum: [
        "accessibility",
        "agriculture",
        "education",
        "energy",
        "environment",
        "healthcare",
        "public administration",
        "rural livelihood",
        "urban development",
        "water related",
        "other",
        "infrastructure",
        "water_management",
        "sanitation",
        "roads_traffic",
        "electricity",
        "health",
        "social",
      ],
      default: "other",
    },

    photos: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],

    videos: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],

    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, default: "Jharkhand", trim: true },
    },

    status: {
      type: String,
      enum: [
        "submitted",
        "approved",
        "rejected",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
      ],
      default: "submitted",
    },

    mergedInto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      default: null,
    },

    mergeInfo: {
      mergedAt: { type: Date },
      mergedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GovernmentUser",
      },
      originalIssueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issue",
      },
    },

    governmentReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GovernmentUser",
      },
      reviewedAt: { type: Date },
      status: { type: String },
      notes: { type: String, trim: true },
      rejectionReason: { type: String, trim: true },
    },

    assignedUniversityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      default: null,
    },

    assignedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

issueSchema.index({ citizenId: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ mergedInto: 1 });
issueSchema.index({ "location.district": 1 });

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;
