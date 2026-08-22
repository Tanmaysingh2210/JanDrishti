import bcrypt from "bcryptjs";

import University from "../models/university.js";
import UniversityUser from "../models/universityUser.js";


// =====================================================
// CREATE UNIVERSITY USER
// =====================================================

export const createUniversityUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      employeeId,
      designation,
      role,
      departmentId,
      password,
      confirmPassword,
    } = req.body;

    const currentUser = req.user;


    // =================================================
    // AUTHENTICATION
    // =================================================

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    // =================================================
    // ONLY UNIVERSITY ADMIN CAN CREATE USERS
    // =================================================

    if (currentUser.role !== "university_admin") {
      return res.status(403).json({
        success: false,
        message:
          "Only university admin can create university users",
      });
    }


    // =================================================
    // REQUIRED FIELDS
    // =================================================

    if (
      !fullName ||
      !email ||
      !role ||
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
    // VALID ROLES
    // =================================================

    const allowedRoles = [
      "nodal_officer",
      "faculty",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid university user role",
      });
    }


    // =================================================
    // NORMALIZE INPUT
    // =================================================

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedMobile =
      mobileNumber?.trim().replace(/\s+/g, "");


    // =================================================
    // EMAIL VALIDATION
    // =================================================

    if (
      !/^\S+@\S+\.\S+$/.test(
        normalizedEmail
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }


    // =================================================
    // MOBILE VALIDATION
    // =================================================

    if (
      normalizedMobile &&
      !/^[6-9]\d{9}$/.test(
        normalizedMobile
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }


    // =================================================
    // GET UNIVERSITY
    // =================================================

    const university =
      await University.findById(
        currentUser.universityId
      );


    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }


    // =================================================
    // UNIVERSITY MUST BE VERIFIED
    // =================================================

    if (
      university.verificationStatus !==
      "verified"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "University is not verified by the government",
      });
    }


    if (!university.isActive) {
      return res.status(403).json({
        success: false,
        message: "University account is inactive",
      });
    }


    // =================================================
    // CHECK EXISTING USER EMAIL
    // =================================================

    const existingUser =
      await UniversityUser.findOne({
        email: normalizedEmail,
      });


    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "A user with this email already exists",
      });
    }


    // =================================================
    // CHECK EMPLOYEE ID
    // =================================================

    if (employeeId) {
      const existingEmployee =
        await UniversityUser.findOne({
          universityId:
            currentUser.universityId,

          employeeId:
            employeeId.trim(),
        });


      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message:
            "Employee ID already exists in this university",
        });
      }
    }


    // =================================================
    // HASH PASSWORD
    // =================================================

    const hashedPassword =
      await bcrypt.hash(password, 12);


    // =================================================
    // CREATE USER
    // =================================================

    const universityUser =
      await UniversityUser.create({
        universityId:
          currentUser.universityId,

        fullName:
          fullName.trim(),

        email:
          normalizedEmail,

        mobileNumber:
          normalizedMobile || undefined,

        employeeId:
          employeeId?.trim() || undefined,

        designation:
          designation?.trim() || undefined,

        role,

        departmentId:
          departmentId || null,

        password:
          hashedPassword,

        isActive: true,

        isVerified: true,
      });


    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "University user created successfully",

      user: {
        id: universityUser._id,

        universityId:
          universityUser.universityId,

        fullName:
          universityUser.fullName,

        email:
          universityUser.email,

        mobileNumber:
          universityUser.mobileNumber,

        employeeId:
          universityUser.employeeId,

        designation:
          universityUser.designation,

        role:
          universityUser.role,

        departmentId:
          universityUser.departmentId,

        isActive:
          universityUser.isActive,

        isVerified:
          universityUser.isVerified,
      },
    });

  } catch (error) {

    console.error(
      "Create University User Error:",
      error
    );


    // =================================================
    // DUPLICATE KEY
    // =================================================

    if (error.code === 11000) {

      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

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


// =====================================================
// GET UNIVERSITY USERS
// =====================================================

export const getUniversityUsers = async (
  req,
  res
) => {
  try {

    const currentUser = req.user;


    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    // User can only access users
    // belonging to their own university

    const users =
      await UniversityUser.find({
        universityId:
          currentUser.universityId,
      })
        .select(
          "-password"
        )
        .populate(
          "departmentId",
          "name code"
        )
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({
      success: true,

      count: users.length,

      users,
    });

  } catch (error) {

    console.error(
      "Get University Users Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// GET SINGLE UNIVERSITY USER
// =====================================================

export const getUniversityUserById = async (
  req,
  res
) => {
  try {

    const currentUser = req.user;

    const { userId } = req.params;


    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    const universityUser =
      await UniversityUser.findOne({
        _id: userId,

        universityId:
          currentUser.universityId,
      })
        .select("-password")
        .populate(
          "departmentId",
          "name code"
        );


    if (!universityUser) {
      return res.status(404).json({
        success: false,
        message: "University user not found",
      });
    }


    return res.status(200).json({
      success: true,
      user: universityUser,
    });

  } catch (error) {

    console.error(
      "Get University User Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// UPDATE UNIVERSITY USER
// =====================================================

export const updateUniversityUser = async (
  req,
  res
) => {
  try {

    const currentUser = req.user;

    const { userId } = req.params;

    const {
      fullName,
      mobileNumber,
      employeeId,
      designation,
      role,
      departmentId,
    } = req.body;


    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    // =================================================
    // ONLY ADMIN CAN UPDATE OTHER USERS
    // =================================================

    if (
      currentUser.role !==
      "university_admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only university admin can update users",
      });
    }


    // =================================================
    // FIND USER IN SAME UNIVERSITY
    // =================================================

    const universityUser =
      await UniversityUser.findOne({
        _id: userId,

        universityId:
          currentUser.universityId,
      });


    if (!universityUser) {
      return res.status(404).json({
        success: false,
        message: "University user not found",
      });
    }


    // =================================================
    // UPDATE
    // =================================================

    if (fullName !== undefined) {
      universityUser.fullName =
        fullName.trim();
    }


    if (mobileNumber !== undefined) {

      const normalizedMobile =
        mobileNumber
          .trim()
          .replace(/\s+/g, "");


      if (
        !/^[6-9]\d{9}$/.test(
          normalizedMobile
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid mobile number",
        });
      }


      universityUser.mobileNumber =
        normalizedMobile;
    }


    if (employeeId !== undefined) {
      universityUser.employeeId =
        employeeId.trim();
    }


    if (designation !== undefined) {
      universityUser.designation =
        designation.trim();
    }


    if (role !== undefined) {

      const allowedRoles = [
        "university_admin",
        "nodal_officer",
        "faculty",
      ];


      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid university user role",
        });
      }


      universityUser.role = role;
    }


    if (departmentId !== undefined) {
      universityUser.departmentId =
        departmentId || null;
    }


    await universityUser.save();


    return res.status(200).json({
      success: true,

      message:
        "University user updated successfully",

      user: {
        id: universityUser._id,
        universityId:
          universityUser.universityId,
        fullName:
          universityUser.fullName,
        email:
          universityUser.email,
        mobileNumber:
          universityUser.mobileNumber,
        employeeId:
          universityUser.employeeId,
        designation:
          universityUser.designation,
        role:
          universityUser.role,
        departmentId:
          universityUser.departmentId,
        isActive:
          universityUser.isActive,
        isVerified:
          universityUser.isVerified,
      },
    });

  } catch (error) {

    console.error(
      "Update University User Error:",
      error
    );


    if (error.code === 11000) {

      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

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


// =====================================================
// ACTIVATE / DEACTIVATE UNIVERSITY USER
// =====================================================

export const toggleUniversityUserStatus = async (
  req,
  res
) => {
  try {

    const currentUser = req.user;

    const { userId } = req.params;


    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    if (
      currentUser.role !==
      "university_admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only university admin can change user status",
      });
    }


    const universityUser =
      await UniversityUser.findOne({
        _id: userId,

        universityId:
          currentUser.universityId,
      });


    if (!universityUser) {
      return res.status(404).json({
        success: false,
        message: "University user not found",
      });
    }


    // Prevent admin from disabling itself
    if (
      String(universityUser._id) ===
      String(currentUser.userId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own account",
      });
    }


    universityUser.isActive =
      !universityUser.isActive;


    await universityUser.save();


    return res.status(200).json({
      success: true,

      message:
        universityUser.isActive
          ? "University user activated"
          : "University user deactivated",

      user: {
        id: universityUser._id,
        isActive:
          universityUser.isActive,
      },
    });

  } catch (error) {

    console.error(
      "Toggle University User Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};