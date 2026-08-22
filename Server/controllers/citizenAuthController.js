import bcrypt from "bcryptjs";
import crypto from "crypto";

import Citizen from "../models/citizen.js";
import generateToken from "../utils/generateToken.js";


// =====================================================
// HASH AADHAAR
// =====================================================

const hashAadhaar = (aadhaarNumber) => {
  return crypto
    .createHash("sha256")
    .update(aadhaarNumber)
    .digest("hex");
};


// =====================================================
// SET JWT COOKIE
// =====================================================

const setTokenCookie = (res, token) => {
  res.cookie("citizen_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production"
      ? "none"
      : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};


// =====================================================
// REGISTER CITIZEN
// =====================================================

export const registerCitizen = async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      aadhaarNumber,
      email,
      password,
      confirmPassword,
    } = req.body;


    // -------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------

    if (
      !fullName ||
      !mobileNumber ||
      !aadhaarNumber ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    // -------------------------------------------------
    // PASSWORD MATCH
    // -------------------------------------------------

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }


    // -------------------------------------------------
    // PASSWORD LENGTH
    // -------------------------------------------------

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }


    // -------------------------------------------------
    // NORMALIZE INPUT
    // -------------------------------------------------

    const normalizedEmail = email.trim().toLowerCase();

    const normalizedMobile = mobileNumber
      .trim()
      .replace(/\s+/g, "");

    const normalizedAadhaar = aadhaarNumber
      .trim()
      .replace(/\s+/g, "");


    // -------------------------------------------------
    // VALIDATE MOBILE
    // -------------------------------------------------

    if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Indian mobile number",
      });
    }


    // -------------------------------------------------
    // VALIDATE AADHAAR
    // -------------------------------------------------

    if (!/^\d{12}$/.test(normalizedAadhaar)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 12-digit Aadhaar number",
      });
    }


    // -------------------------------------------------
    // VALIDATE EMAIL
    // -------------------------------------------------

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }


    // -------------------------------------------------
    // HASH AADHAAR
    // -------------------------------------------------

    const aadhaarHash = hashAadhaar(normalizedAadhaar);

    const aadhaarLast4 = normalizedAadhaar.slice(-4);


    // -------------------------------------------------
    // CHECK EXISTING CITIZEN
    // -------------------------------------------------

    const existingCitizen = await Citizen.findOne({
      $or: [
        { mobileNumber: normalizedMobile },
        { email: normalizedEmail },
        { aadhaarHash },
      ],
    }).select("+aadhaarHash");


    if (existingCitizen) {

      if (
        existingCitizen.mobileNumber === normalizedMobile
      ) {
        return res.status(409).json({
          success: false,
          message: "Mobile number is already registered",
        });
      }


      if (
        existingCitizen.email === normalizedEmail
      ) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered",
        });
      }


      if (
        existingCitizen.aadhaarHash === aadhaarHash
      ) {
        return res.status(409).json({
          success: false,
          message: "Aadhaar number is already registered",
        });
      }
    }


    // -------------------------------------------------
    // HASH PASSWORD
    // -------------------------------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );


    // -------------------------------------------------
    // CREATE CITIZEN
    // -------------------------------------------------

    const citizen = await Citizen.create({
      fullName: fullName.trim(),
      mobileNumber: normalizedMobile,
      aadhaarHash,
      aadhaarLast4,
      email: normalizedEmail,
      password: hashedPassword,
    });


    // -------------------------------------------------
    // GENERATE JWT
    // -------------------------------------------------

    const token = generateToken(citizen._id);


    // -------------------------------------------------
    // SET COOKIE
    // -------------------------------------------------

    setTokenCookie(res, token);


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Citizen registered successfully",

      citizen: {
        id: citizen._id,
        fullName: citizen.fullName,
        mobileNumber: citizen.mobileNumber,
        email: citizen.email,
        aadhaarLast4: citizen.aadhaarLast4,
        isVerified: citizen.isVerified,
      },
    });

  } catch (error) {

    console.error(
      "Register Citizen Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// LOGIN CITIZEN
// =====================================================

export const loginCitizen = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;


    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }


    const normalizedEmail = email
      .trim()
      .toLowerCase();


    // -------------------------------------------------
    // FIND CITIZEN
    // -------------------------------------------------

    const citizen = await Citizen
      .findOne({
        email: normalizedEmail,
      })
      .select("+password");


    if (!citizen) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    // -------------------------------------------------
    // CHECK ACTIVE
    // -------------------------------------------------

    if (!citizen.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }


    // -------------------------------------------------
    // COMPARE PASSWORD
    // -------------------------------------------------

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        citizen.password
      );


    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    // -------------------------------------------------
    // GENERATE JWT
    // -------------------------------------------------

    const token =
      generateToken(citizen._id);


    // -------------------------------------------------
    // SET COOKIE
    // -------------------------------------------------

    setTokenCookie(res, token);


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful",

      citizen: {
        id: citizen._id,
        fullName: citizen.fullName,
        mobileNumber: citizen.mobileNumber,
        email: citizen.email,
        aadhaarLast4: citizen.aadhaarLast4,
        isVerified: citizen.isVerified,
      },
    });

  } catch (error) {

    console.error(
      "Login Citizen Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// GET CURRENT CITIZEN
// =====================================================

export const getCurrentCitizen = async (req, res) => {
  try {

    const citizen = await Citizen.findById(
      req.user.userId
    );

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }


    return res.status(200).json({
      success: true,

      citizen: {
        id: citizen._id,
        fullName: citizen.fullName,
        mobileNumber: citizen.mobileNumber,
        email: citizen.email,
        aadhaarLast4: citizen.aadhaarLast4,
        isVerified: citizen.isVerified,
      },
    });

  } catch (error) {

    console.error(
      "Get Current Citizen Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// LOGOUT CITIZEN
// =====================================================

export const logoutCitizen = async (req, res) => {
  try {

    res.clearCookie("citizen_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    });


    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });

  } catch (error) {

    console.error(
      "Logout Citizen Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};