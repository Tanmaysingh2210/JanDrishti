import jwt from "jsonwebtoken";

const citizenAuth = (req, res, next) => {
  try {
    // -----------------------------------------
    // Get token from cookie OR Authorization header
    // -----------------------------------------

    let token = req.cookies?.citizen_token;

    // React Native will use:
    // Authorization: Bearer <token>

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;

      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    // -----------------------------------------
    // No token
    // -----------------------------------------

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // -----------------------------------------
    // Verify JWT
    // -----------------------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // -----------------------------------------
    // Make sure token belongs to citizen
    // -----------------------------------------

    if (decoded.userType !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // -----------------------------------------
    // Attach user information
    // -----------------------------------------

    req.user = decoded;

    next();

  } catch (error) {

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }
};

export default citizenAuth;