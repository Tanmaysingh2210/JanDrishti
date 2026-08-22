import mongoose from "mongoose";

const governmentUserSchema = new mongoose.Schema(
  {
    governmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Government",
      required: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please enter a valid email address",
      ],
    },

    mobileNumber: {
      type: String,
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid Indian mobile number",
      ],
    },

    employeeId: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    designation: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    role: {
      type: String,
      enum: [
        "government_admin",
        "state_official",
        "district_official",
        "department_official",
      ],
      required: true,
    },

    department: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const GovernmentUser = mongoose.model(
  "GovernmentUser",
  governmentUserSchema
);

export default GovernmentUser;