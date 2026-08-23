import Government from "../models/government.js";
import mongoose from "mongoose";


const createGovernment = async () => {

  const MONGO_URI = "mongodb+srv://wallbookservice_db_user:kqNT5kXUnwHnqYHy@cluster0.jlglxtw.mongodb.net/JanDrishti";
  
  try {
    await mongoose.connect(MONGO_URI);

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