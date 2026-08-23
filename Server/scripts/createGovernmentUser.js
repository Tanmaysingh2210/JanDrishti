import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import GovernmentUser from "../models/governmentUser.js";

dotenv.config();

const createGovernmentUser = async () => {
  try {
    await connectDB();

    const governmentId = "6a8a2e18797ca4100dda80d4";

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