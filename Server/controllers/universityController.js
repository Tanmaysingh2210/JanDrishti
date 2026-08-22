import bcrypt from "bcryptjs";

import University from "../models/university.js";
import UniversityUser from "../models/universityUser.js";


// =====================================================
// REGISTER UNIVERSITY
// =====================================================

export const registerUniversity = async (req, res) => {
  try {
    const {
      universityName,
      shortName,
      code,
      type,
      email,
      phone,
      website,
      address,
      district,
      state,
      
      // Initial university representative
      representativeName,
      representativeEmail,
      representativeMobile,
      representativeDesignation,
      password,
      confirmPassword,
    } = req.body;


    // =================================================
    // REQUIRED FIELDS
    // =================================================

    if (
      !universityName ||
      !code ||
      !email ||
      !representativeName ||
      !representativeEmail ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }


    // =================================================
    // PASSWORD MATCH
    // =================================================

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }


    // =================================================
    // PASSWORD LENGTH
    // =================================================

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }


    // =================================================
    // NORMALIZE DATA
    // =================================================

    const normalizedUniversityName =
      universityName.trim();

    const normalizedCode =
      code.trim().toUpperCase();

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedRepresentativeEmail =
      representativeEmail.trim().toLowerCase();

    const normalizedPhone =
      phone?.trim().replace(/\s+/g, "");

    const normalizedRepresentativeMobile =
      representativeMobile?.trim().replace(/\s+/g, "");


    // =================================================
    // EMAIL VALIDATION
    // =================================================

    const emailRegex =
      /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid university email",
      });
    }


    if (!emailRegex.test(normalizedRepresentativeEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid representative email",
      });
    }


    // =================================================
    // MOBILE VALIDATION
    // =================================================

    if (
      normalizedPhone &&
      !/^[6-9]\d{9}$/.test(normalizedPhone)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid university phone number",
      });
    }


    if (
      normalizedRepresentativeMobile &&
      !/^[6-9]\d{9}$/.test(
        normalizedRepresentativeMobile
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid representative mobile number",
      });
    }


    // =================================================
    // CHECK EXISTING UNIVERSITY
    // =================================================

    const existingUniversity =
      await University.findOne({
        $or: [
          { code: normalizedCode },
          { email: normalizedEmail },
        ],
      });


    if (existingUniversity) {

      if (
        existingUniversity.code === normalizedCode
      ) {
        return res.status(409).json({
          success: false,
          message: "University code is already registered",
        });
      }


      if (
        existingUniversity.email === normalizedEmail
      ) {
        return res.status(409).json({
          success: false,
          message: "University email is already registered",
        });
      }
    }


    // =================================================
    // CHECK EXISTING REPRESENTATIVE
    // =================================================

    const existingUser =
      await UniversityUser.findOne({
        email: normalizedRepresentativeEmail,
      });


    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "Representative email is already registered",
      });
    }


    // =================================================
    // VERIFICATION DOCUMENT
    // =================================================

    /*
      The frontend should send the verification document
      using multipart/form-data.

      multer will place the uploaded file in:

      req.file

      Example:
      req.file.path
      req.file.filename
      req.file.mimetype
    */

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "University verification document is required",
      });
    }


    // =================================================
    // HASH PASSWORD
    // =================================================

    const hashedPassword =
      await bcrypt.hash(password, 12);


    // =================================================
    // CREATE UNIVERSITY
    // =================================================

    const university =
      await University.create({
        name: normalizedUniversityName,

        shortName:
          shortName?.trim() || undefined,

        code: normalizedCode,

        type:
          type || "other",

        email: normalizedEmail,

        phone:
          normalizedPhone || undefined,

        website:
          website?.trim() || undefined,

        address:
          address?.trim() || undefined,

        district:
          district?.trim() || undefined,

        state:
          state?.trim() || "Jharkhand",

        verificationStatus:
          "pending",

        verificationDocument: {
          url: req.file.path,
          publicId: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
        },

        isActive: false,
      });


    // =================================================
    // CREATE INITIAL UNIVERSITY USER
    // =================================================

    const universityUser =
      await UniversityUser.create({
        universityId: university._id,

        fullName:
          representativeName.trim(),

        email:
          normalizedRepresentativeEmail,

        mobileNumber:
          normalizedRepresentativeMobile ||
          undefined,

        designation:
          representativeDesignation?.trim() ||
          undefined,

        role:
          "university_admin",

        password:
          hashedPassword,

        isActive: false,

        isVerified: false,
      });


    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "University registration submitted successfully. Awaiting government verification.",

      university: {
        id: university._id,
        name: university.name,
        code: university.code,
        email: university.email,
        verificationStatus:
          university.verificationStatus,
      },

      representative: {
        id: universityUser._id,
        name: universityUser.fullName,
        email: universityUser.email,
        role: universityUser.role,
      },
    });

  } catch (error) {

    console.error(
      "Register University Error:",
      error
    );


    // =================================================
    // DUPLICATE KEY ERROR
    // =================================================

    if (error.code === 11000) {

      const duplicateField =
        Object.keys(error.keyPattern || {})[0];

      return res.status(409).json({
        success: false,
        message:
          `${duplicateField || "Information"} is already registered`,
      });
    }


    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};