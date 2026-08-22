import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Industry from "../models/industry.js";

const generateIndustryToken = (industry) => {
  return jwt.sign(
    {
      userId: industry._id,
      industryId: industry._id,
      userType: "industry",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const setIndustryCookie = (res, token) => {
  res.cookie("industry_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};


// Register industry
export const registerIndustry = async (req, res) => {
  try {
    const {
      companyName,
      companyCode,
      registrationNumber,
      industryType,
      email,
      phone,
      website,
      address,
      district,
      state,
      contactPerson,
      password,
      confirmPassword,
    } = req.body;

    if (
      !companyName ||
      !companyCode ||
      !registrationNumber ||
      !email ||
      !phone ||
      !contactPerson?.name ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedCompanyCode =
      companyCode.trim().toUpperCase();

    const normalizedRegistrationNumber =
      registrationNumber.trim();

    const normalizedPhone =
      phone.trim().replace(/\s+/g, "");

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    const normalizedContactMobile =
      contactPerson.mobileNumber
        ?.trim()
        .replace(/\s+/g, "");

    if (
      normalizedContactMobile &&
      !/^[6-9]\d{9}$/.test(
        normalizedContactMobile
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid contact person mobile number",
      });
    }

    const existingIndustry =
      await Industry.findOne({
        $or: [
          {
            companyCode:
              normalizedCompanyCode,
          },
          {
            registrationNumber:
              normalizedRegistrationNumber,
          },
          {
            email:
              normalizedEmail,
          },
        ],
      });

    if (existingIndustry) {
      if (
        existingIndustry.companyCode ===
        normalizedCompanyCode
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Company code is already registered",
        });
      }

      if (
        existingIndustry.registrationNumber ===
        normalizedRegistrationNumber
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Company registration number is already registered",
        });
      }

      if (
        existingIndustry.email ===
        normalizedEmail
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Company email is already registered",
        });
      }
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const industry =
      await Industry.create({
        companyName:
          companyName.trim(),

        companyCode:
          normalizedCompanyCode,

        registrationNumber:
          normalizedRegistrationNumber,

        industryType:
          industryType?.trim() || undefined,

        email:
          normalizedEmail,

        phone:
          normalizedPhone,

        website:
          website?.trim() || undefined,

        address:
          address?.trim() || undefined,

        district:
          district?.trim() || undefined,

        state:
          state?.trim() || "Jharkhand",

        contactPerson: {
          name:
            contactPerson.name.trim(),

          designation:
            contactPerson.designation?.trim() ||
            undefined,

          mobileNumber:
            normalizedContactMobile ||
            undefined,
        },

        password:
          hashedPassword,

        isActive: true,
      });

    const token =
      generateIndustryToken(industry);

    setIndustryCookie(
      res,
      token
    );

    return res.status(201).json({
      success: true,
      message:
        "Industry registered successfully",

      industry: {
        id: industry._id,
        companyName:
          industry.companyName,
        companyCode:
          industry.companyCode,
        email:
          industry.email,
        industryType:
          industry.industryType,
        contactPerson:
          industry.contactPerson,
      },
    });
  } catch (error) {
    console.error(
      "Register Industry Error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Company information is already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Login industry
export const loginIndustry = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const industry =
      await Industry.findOne({
        email: normalizedEmail,
      }).select("+password");

    if (!industry) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    if (!industry.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Industry account is inactive",
      });
    }

    const passwordCorrect =
      await bcrypt.compare(
        password,
        industry.password
      );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const token =
      generateIndustryToken(industry);

    setIndustryCookie(
      res,
      token
    );

    return res.status(200).json({
      success: true,
      message:
        "Industry login successful",

      industry: {
        id: industry._id,
        companyName:
          industry.companyName,
        companyCode:
          industry.companyCode,
        email:
          industry.email,
        industryType:
          industry.industryType,
        contactPerson:
          industry.contactPerson,
      },
    });
  } catch (error) {
    console.error(
      "Industry Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Current industry
export const getCurrentIndustry = async (
  req,
  res
) => {
  try {
    const industry =
      await Industry.findById(
        req.user.industryId
      );

    if (!industry) {
      return res.status(404).json({
        success: false,
        message:
          "Industry account not found",
      });
    }

    return res.status(200).json({
      success: true,

      industry: {
        id: industry._id,
        companyName:
          industry.companyName,
        companyCode:
          industry.companyCode,
        registrationNumber:
          industry.registrationNumber,
        industryType:
          industry.industryType,
        email:
          industry.email,
        phone:
          industry.phone,
        website:
          industry.website,
        address:
          industry.address,
        district:
          industry.district,
        state:
          industry.state,
        contactPerson:
          industry.contactPerson,
        isActive:
          industry.isActive,
      },
    });
  } catch (error) {
    console.error(
      "Get Current Industry Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Logout industry
export const logoutIndustry = async (
  req,
  res
) => {
  try {
    res.clearCookie(
      "industry_token",
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Industry logout successful",
    });
  } catch (error) {
    console.error(
      "Industry Logout Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};