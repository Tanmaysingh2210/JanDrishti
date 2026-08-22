import mongoose from "mongoose";

const governmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    officeType: {
      type: String,
      enum: [
        "state",
        "district",
        "department",
        "other",
      ],
      default: "other",
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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Government = mongoose.model(
  "Government",
  governmentSchema
);

export default Government;