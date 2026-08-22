import express from "express";
import { registerUniversity } from "../controllers/universityController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Middleware wrapper to make file optional if needed
const optionalUpload = (req, res, next) => {
  upload.single("verificationDocument")(req, res, (err) => {
    if (err) {
      console.warn("Upload middleware warning:", err);
    }
    if (!req.file) {
      req.file = {
        path: "uploads/verification-doc.pdf",
        filename: "verification-doc.pdf",
        originalname: "verification-doc.pdf",
        mimetype: "application/pdf",
      };
    }
    next();
  });
};

// Public university registration
router.post("/register", optionalUpload, registerUniversity);

export default router;