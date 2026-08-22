import mongoose from "mongoose";

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "University name is required"],
      trim: true,
      maxlength: [200, "University name cannot exceed 200 characters"],
    },

    shortName: {
      type: String,
      trim: true,
      maxlength: [50, "Short name cannot exceed 50 characters"],
    },

    code: {
      type: String,
      required: [true, "University code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "government",
        "private",
        "deemed",
        "other",
      ],
      default: "other",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      default: "Jharkhand",
      trim: true,
    },

    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const University = mongoose.model(
  "University",
  universitySchema
);

export default University;