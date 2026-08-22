import bcrypt from "bcryptjs";

import Government from "../models/government.js";
import GovernmentUser from "../models/governmentUser.js";

export const createGovernmentUser = async (req, res) => {
  try {
    if (req.user.role !== "government_admin") {
      return res.status(403).json({
        success: false,
        message: "Only government admin can create government users",
      });
    }

    const {
      fullName,
      email,
      mobileNumber,
      employeeId,
      designation,
      role,
      department,
      district,
      password,
      confirmPassword,
    } = req.body;

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

    const allowedRoles = [
      "state_official",
      "district_official",
      "department_official",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid government user role",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const normalizedMobile =
      mobileNumber?.trim().replace(/\s+/g, "");

    if (
      normalizedMobile &&
      !/^[6-9]\d{9}$/.test(normalizedMobile)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }

    const government = await Government.findById(
      req.user.governmentId
    );

    if (!government) {
      return res.status(404).json({
        success: false,
        message: "Government organization not found",
      });
    }

    if (!government.isActive) {
      return res.status(403).json({
        success: false,
        message: "Government organization is inactive",
      });
    }

    const existingUser = await GovernmentUser.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    if (employeeId) {
      const existingEmployee = await GovernmentUser.findOne({
        governmentId: req.user.governmentId,
        employeeId: employeeId.trim(),
      });

      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message: "Employee ID already exists",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const governmentUser = await GovernmentUser.create({
      governmentId: req.user.governmentId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobileNumber: normalizedMobile || undefined,
      employeeId: employeeId?.trim() || undefined,
      designation: designation?.trim() || undefined,
      role,
      department: department?.trim() || undefined,
      district: district?.trim() || undefined,
      password: hashedPassword,
      isActive: true,
      isVerified: true,
    });

    return res.status(201).json({
      success: true,
      message: "Government user created successfully",
      user: {
        id: governmentUser._id,
        governmentId: governmentUser.governmentId,
        fullName: governmentUser.fullName,
        email: governmentUser.email,
        mobileNumber: governmentUser.mobileNumber,
        employeeId: governmentUser.employeeId,
        designation: governmentUser.designation,
        role: governmentUser.role,
        department: governmentUser.department,
        district: governmentUser.district,
        isActive: governmentUser.isActive,
        isVerified: governmentUser.isVerified,
      },
    });
  } catch (error) {
    console.error("Create Government User Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User information already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getGovernmentUsers = async (req, res) => {
  try {
    const users = await GovernmentUser.find({
      governmentId: req.user.governmentId,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get Government Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getGovernmentUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await GovernmentUser.findOne({
      _id: userId,
      governmentId: req.user.governmentId,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Government user not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Government User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateGovernmentUser = async (req, res) => {
  try {
    if (req.user.role !== "government_admin") {
      return res.status(403).json({
        success: false,
        message: "Only government admin can update users",
      });
    }

    const { userId } = req.params;

    const {
      fullName,
      mobileNumber,
      employeeId,
      designation,
      role,
      department,
      district,
    } = req.body;

    const user = await GovernmentUser.findOne({
      _id: userId,
      governmentId: req.user.governmentId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Government user not found",
      });
    }

    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }

    if (mobileNumber !== undefined) {
      const normalizedMobile =
        mobileNumber.trim().replace(/\s+/g, "");

      if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
        return res.status(400).json({
          success: false,
          message: "Invalid mobile number",
        });
      }

      user.mobileNumber = normalizedMobile;
    }

    if (employeeId !== undefined) {
      user.employeeId = employeeId.trim();
    }

    if (designation !== undefined) {
      user.designation = designation.trim();
    }

    if (role !== undefined) {
      const allowedRoles = [
        "government_admin",
        "state_official",
        "district_official",
        "department_official",
      ];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid government user role",
        });
      }

      user.role = role;
    }

    if (department !== undefined) {
      user.department = department.trim();
    }

    if (district !== undefined) {
      user.district = district.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Government user updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        employeeId: user.employeeId,
        designation: user.designation,
        role: user.role,
        department: user.department,
        district: user.district,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update Government User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const toggleGovernmentUserStatus = async (req, res) => {
  try {
    if (req.user.role !== "government_admin") {
      return res.status(403).json({
        success: false,
        message: "Only government admin can change user status",
      });
    }

    const { userId } = req.params;

    const user = await GovernmentUser.findOne({
      _id: userId,
      governmentId: req.user.governmentId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Government user not found",
      });
    }

    if (
      String(user._id) ===
      String(req.user.userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    user.isActive = !user.isActive;

    await user.save();

    return res.status(200).json({
      success: true,
      message: user.isActive
        ? "Government user activated"
        : "Government user deactivated",
      user: {
        id: user._id,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(
      "Toggle Government User Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};