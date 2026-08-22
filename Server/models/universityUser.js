import mongoose from "mongoose";

const universityUserSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: [true, "University is required"],
      index: true,
    },

    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
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
      maxlength: [50, "Employee ID cannot exceed 50 characters"],
    },

    designation: {
      type: String,
      trim: true,
      maxlength: [100, "Designation cannot exceed 100 characters"],
    },

    role: {
      type: String,
      enum: [
        "university_admin",
        "nodal_officer",
        "faculty",
      ],
      required: [true, "University role is required"],
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UniversityUser = mongoose.model(
  "UniversityUser",
  universityUserSchema
);

export default UniversityUser;