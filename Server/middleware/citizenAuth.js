import jwt from "jsonwebtoken";

const citizenAuth = (req, res, next) => {
  try {

    const token =
      req.cookies.citizen_token;


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


    // Make sure this token belongs to a citizen
    if (decoded.userType !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }


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