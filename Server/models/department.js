import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      maxlength: [150, "Department name cannot exceed 150 characters"],
    },

    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [30, "Department code cannot exceed 30 characters"],
    },

    description: {
      type: String,
      trim: true,
    },

    expertise: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model(
  "Department",
  departmentSchema
);

export default Department;