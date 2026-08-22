import jwt from "jsonwebtoken";

const generateToken = (citizenId) => {
  return jwt.sign(
    {
      userId: citizenId,
      userType: "citizen",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export default generateToken;