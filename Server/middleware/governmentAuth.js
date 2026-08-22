import jwt from "jsonwebtoken";

const governmentAuth = (req, res, next) => {
  try {
    const token =
      req.cookies.government_token;

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

    if (
      decoded.userType !== "government"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (
      !decoded.userId ||
      !decoded.governmentId ||
      !decoded.role
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid government authentication token",
      });
    }

    req.user = {
      userId: decoded.userId,
      governmentId: decoded.governmentId,
      userType: decoded.userType,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error(
      "Government Auth Error:",
      error
    );

    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Government session expired. Please login again",
      });
    }

    if (
      error.name ===
      "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid government authentication token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

export default governmentAuth;