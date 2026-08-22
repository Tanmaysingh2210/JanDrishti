import jwt from "jsonwebtoken";

const industryAuth = (req, res, next) => {
  try {
    const token = req.cookies.industry_token;

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

    if (decoded.userType !== "industry") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (
      !decoded.userId ||
      !decoded.industryId
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid industry authentication token",
      });
    }

    req.user = {
      userId: decoded.userId,
      industryId: decoded.industryId,
      userType: decoded.userType,
    };

    next();
  } catch (error) {
    console.error(
      "Industry Auth Error:",
      error
    );

    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Industry session expired. Please login again",
      });
    }

    return res.status(401).json({
      success: false,
      message:
        "Invalid industry authentication token",
    });
  }
};

export default industryAuth;