import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Government from "../models/government.js";

dotenv.config();

const createGovernment = async () => {
  try {
    await connectDB();

    const government = await Government.create({
      name: "Department of Urban Development & Housing",
      code: "UDHD-RANCHI-01",
      department: "Urban Infrastructure & Smart Cities",
      officeType: "department",
      district: "Ranchi",
      state: "Jharkhand",
    });

    console.log("Government organization created successfully:");
    console.log(government);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create government organization:");
    console.error(error.message);

    process.exit(1);
  }
};

createGovernment();