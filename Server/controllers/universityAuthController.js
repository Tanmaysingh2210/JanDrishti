import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UniversityUser from "../models/universityUser.js";
import University from "../models/university.js";

const generateUniversityToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      universityId: user.universityId,
      userType: "university",
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const setUniversityCookie = (res, token) => {
  res.cookie("university_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const loginUniversity = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await UniversityUser.findOne({
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
        message: "University user account is inactive",
      });
    }

    const university = await University.findById(user.universityId);

    if (!university || !university.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "University account is inactive or pending government verification",
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateUniversityToken(user);

    setUniversityCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "University login successful",
      user: {
        id: user._id,
        universityId: university._id,
        universityName: university.name,
        universityCode: university.code,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
      },
    });
  } catch (error) {
    console.error("University Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCurrentUniversityUser = async (req, res) => {
  try {
    const user = await UniversityUser.findById(req.user.userId)
      .select("-password")
      .populate("universityId")
      .populate("departmentId");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "University user not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Current University User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logoutUniversity = async (req, res) => {
  try {
    res.clearCookie("university_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "University logout successful",
    });
  } catch (error) {
    console.error("University Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
