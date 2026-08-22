import jwt from "jsonwebtoken";

const universityAuth = (req, res, next) => {
  try {

    const token = req.cookies.university_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.userType !== "university") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (
      !decoded.userId ||
      !decoded.universityId ||
      !decoded.role
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid university authentication token",
      });
    }

    req.user = {
      userId: decoded.userId,
      universityId: decoded.universityId,
      role: decoded.role,
      userType: decoded.userType,
    };

    next();

  } catch (error) {

    console.error(
      "University Auth Error:",
      error
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message:
          "University session expired. Please login again",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message:
          "Invalid university authentication token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

export default universityAuth;