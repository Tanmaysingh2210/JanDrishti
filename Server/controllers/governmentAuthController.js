import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import GovernmentUser from "../models/governmentUser.js";

const generateGovernmentToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      governmentId: user.governmentId,
      userType: "government",
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const setGovernmentCookie = (res, token) => {
  res.cookie("government_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const loginGovernment = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await GovernmentUser.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Government account is inactive",
      });
    }

    const government = await user.populate(
      "governmentId"
    );

    if (
      !government.governmentId ||
      !government.governmentId.isActive
    ) {
      return res.status(403).json({
        success: false,
        message: "Government organization is inactive",
      });
    }

    const passwordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token =
      generateGovernmentToken(user);

    setGovernmentCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Government login successful",
      user: {
        id: user._id,
        governmentId: user.governmentId._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        designation: user.designation,
        department: user.department,
        district: user.district,
      },
    });
  } catch (error) {
    console.error(
      "Government Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCurrentGovernmentUser = async (
  req,
  res
) => {
  try {
    const user = await GovernmentUser.findById(
      req.user.userId
    )
      .select("-password")
      .populate(
        "governmentId"
      );

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
    console.error(
      "Get Current Government User Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logoutGovernment = async (
  req,
  res
) => {
  try {
    res.clearCookie("government_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Government logout successful",
    });
  } catch (error) {
    console.error(
      "Government Logout Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};