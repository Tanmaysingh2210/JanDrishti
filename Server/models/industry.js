import mongoose from "mongoose";

const industrySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    companyCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 50,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    industryType: {
      type: String,
      trim: true,
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

    phone: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid Indian mobile number",
      ],
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

    contactPerson: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      designation: {
        type: String,
        trim: true,
      },

      mobileNumber: {
        type: String,
        trim: true,
        match: [
          /^[6-9]\d{9}$/,
          "Please enter a valid Indian mobile number",
        ],
      },
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
  },
  {
    timestamps: true,
  }
);

const Industry = mongoose.model(
  "Industry",
  industrySchema
);

export default Industry;