import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    targetDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    completedAt: { type: Date },
  },
  { _id: true }
);

const projectUpdateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UniversityUser",
      required: true,
    },
    media: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "Issue ID is required"],
      unique: true,
    },

    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: [true, "University ID is required"],
    },

    acceptedProposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UniversityProposal",
      required: [true, "Accepted Proposal ID is required"],
    },

    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: ["assigned", "in_progress", "completed", "suspended"],
      default: "assigned",
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    targetCompletionDate: {
      type: Date,
    },

    actualCompletionDate: {
      type: Date,
    },

    milestones: [milestoneSchema],

    updates: [projectUpdateSchema],
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ universityId: 1, status: 1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;
