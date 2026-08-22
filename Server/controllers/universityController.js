import bcrypt from "bcryptjs";

import University from "../models/university.js";
import UniversityUser from "../models/universityUser.js";


// =====================================================
// 1. REQUEST UNIVERSITY APPROVAL (STAGE 1)
// =====================================================

export const requestUniversityApproval = async (req, res) => {
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
    } = req.body;

    if (!universityName || !code || !email) {
      return res.status(400).json({
        success: false,
        message: "University name, code, and official email are required",
      });
    }

    const normalizedUniversityName = universityName.trim();
    const normalizedCode = code.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone?.trim().replace(/\s+/g, "");

    const allowedTypes = ["government", "central", "state", "private", "deemed", "other"];
    let finalType = type?.trim().toLowerCase();
    if (!allowedTypes.includes(finalType)) {
      finalType = "other";
    }

    // Check if university email or code already exists
    const existingUniversity = await University.findOne({
      $or: [{ code: normalizedCode }, { email: normalizedEmail }],
    });

    if (existingUniversity) {
      if (existingUniversity.email === normalizedEmail) {
        return res.status(409).json({
          success: false,
          message: "This official email has already been used to request approval or register.",
        });
      }

      if (existingUniversity.code === normalizedCode) {
        return res.status(409).json({
          success: false,
          message: "This university code has already been used to request approval or register.",
        });
      }
    }

    const university = await University.create({
      name: normalizedUniversityName,
      shortName: shortName?.trim() || undefined,
      code: normalizedCode,
      type: finalType,
      email: normalizedEmail,
      phone: normalizedPhone || undefined,
      website: website?.trim() || undefined,
      address: address?.trim() || undefined,
      district: district?.trim() || undefined,
      state: state?.trim() || "Jharkhand",
      isActive: false,
      isApproved: false, // Waits for government approval
    });

    return res.status(201).json({
      success: true,
      message: "University approval request submitted successfully. Awaiting government review.",
      university: {
        id: university._id,
        name: university.name,
        code: university.code,
        email: university.email,
        isApproved: university.isApproved,
      },
    });
  } catch (error) {
    console.error("Request University Approval Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


// =====================================================
// 2. CHECK UNIVERSITY APPROVAL STATUS
// =====================================================

export const checkUniversityApprovalStatus = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Official university email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const university = await University.findOne({
      $or: [{ email: normalizedEmail }, { "representative.email": normalizedEmail }],
    });

    if (!university) {
      return res.status(404).json({
        success: false,
        message: "No university approval request found for this email. Please fill in university details first.",
      });
    }

    // Check if representative user already created
    const existingUser = await UniversityUser.findOne({
      universityId: university._id,
    });

    return res.status(200).json({
      success: true,
      isApproved: university.isApproved,
      hasRepresentative: !!existingUser,
      university: {
        id: university._id,
        name: university.name,
        code: university.code,
        email: university.email,
        type: university.type,
        isApproved: university.isApproved,
      },
    });
  } catch (error) {
    console.error("Check Approval Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error checking approval status",
    });
  }
};


// =====================================================
// 3. REGISTER UNIVERSITY / COMPLETE SETUP (STAGE 2)
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

    if (!password || !confirmPassword || !representativeName || !representativeEmail) {
      return res.status(400).json({
        success: false,
        message: "Representative details and passwords are required",
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

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedRepresentativeEmail = representativeEmail.trim().toLowerCase();

    // Find university by email or code
    let university = await University.findOne({
      $or: [{ email: normalizedEmail }, { code: code?.trim().toUpperCase() }],
    });

    if (!university) {
      // Create approved university directly
      university = await University.create({
        name: universityName?.trim() || "University Institution",
        shortName: shortName?.trim() || undefined,
        code: code?.trim().toUpperCase() || `UNIV-${Date.now().toString().slice(-4)}`,
        type: type || "government",
        email: normalizedEmail || normalizedRepresentativeEmail,
        phone: phone || undefined,
        address: address || undefined,
        district: district || undefined,
        state: state || "Jharkhand",
        isActive: true,
        isApproved: true,
      });
    } else {
      university.isApproved = true;
      university.isActive = true;
      await university.save();
    }

    // Check existing representative user
    const existingUser = await UniversityUser.findOne({
      email: normalizedRepresentativeEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Representative email is already registered as an admin user.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const universityUser = await UniversityUser.create({
      universityId: university._id,
      fullName: representativeName.trim(),
      email: normalizedRepresentativeEmail,
      mobileNumber: representativeMobile || undefined,
      designation: representativeDesignation?.trim() || undefined,
      role: "university_admin",
      password: hashedPassword,
      isActive: true,
      isVerified: true,
    });

    return res.status(201).json({
      success: true,
      message: "University registration completed successfully! You can now log in.",
      university: {
        id: university._id,
        name: university.name,
        code: university.code,
        email: university.email,
        isApproved: university.isApproved,
      },
      representative: {
        id: universityUser._id,
        name: universityUser.fullName,
        email: universityUser.email,
        role: universityUser.role,
      },
    });
  } catch (error) {
    console.error("Register University Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


// =====================================================
// GET ALL UNIVERSITIES
// =====================================================

export const getAllUniversities = async (req, res) => {
  try {
    const universities = await University.find().sort({ createdAt: -1 });

    const universitiesWithUsers = await Promise.all(
      universities.map(async (univ) => {
        const adminUser = await UniversityUser.findOne({
          universityId: univ._id,
          role: "university_admin",
        });

        return {
          id: univ._id,
          name: univ.name,
          shortName: univ.shortName,
          code: univ.code,
          type: univ.type,
          email: univ.email,
          phone: univ.phone,
          website: univ.website,
          address: univ.address,
          district: univ.district,
          state: univ.state,
          isApproved: univ.isApproved,
          isActive: univ.isActive,
          createdAt: univ.createdAt,
          representative: adminUser
            ? {
                name: adminUser.fullName,
                email: adminUser.email,
                mobile: adminUser.mobileNumber,
                designation: adminUser.designation,
              }
            : null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: universitiesWithUsers.length,
      universities: universitiesWithUsers,
    });
  } catch (error) {
    console.error("Get All Universities Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching universities",
    });
  }
};


// =====================================================
// APPROVE UNIVERSITY
// =====================================================

export const approveUniversity = async (req, res) => {
  try {
    const { id } = req.params;

    const university = await University.findByIdAndUpdate(
      id,
      { isApproved: true, isActive: true },
      { new: true }
    );

    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "University approved successfully.",
      university,
    });
  } catch (error) {
    console.error("Approve University Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error approving university",
    });
  }
};