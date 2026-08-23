import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import GovernmentUser from "../models/governmentUser.js";
const MONGO_URI =
  "mongodb+srv://wallbookservice_db_user:kqNT5kXUnwHnqYHy@cluster0.jlglxtw.mongodb.net/JanDrishti";


const createGovernmentUser = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const governmentId = "6a8ae9e112b6d8e82de07eb7";

    const existingUser = await GovernmentUser.findOne({
      email: "rajesh.kumar@gov.in",
    });

    if (existingUser) {
      console.log("Government user already exists.");
      process.exit(0);
    }

    const password = "GovtAdmin@123";

    const hashedPassword = await bcrypt.hash(password, 12);

    const governmentUser = await GovernmentUser.create({
      governmentId,
      fullName: "Rajesh Kumar",
      email: "rajesh.kumar@gov.in",
      mobileNumber: "9876543210",
      employeeId: "EMP-GOVT-1001",
      designation: "District Nodal Officer",
      role: "government_admin",
      department: "Urban Development & Housing",
      district: "Ranchi",
      password: hashedPassword,
    });

    console.log("Government user created successfully:");
    console.log({
      id: governmentUser._id,
      name: governmentUser.fullName,
      email: governmentUser.email,
      role: governmentUser.role,
      governmentId: governmentUser.governmentId,
    });

    process.exit(0);
  } catch (error) {
    console.error("Failed to create government user:");
    console.error(error.message);

    process.exit(1);
  }
};

createGovernmentUser();