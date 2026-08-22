import express from "express";
import {
  loginUniversity,
  getCurrentUniversityUser,
  logoutUniversity,
} from "../controllers/universityAuthController.js";
import {
  requestUniversityApproval,
  checkUniversityApprovalStatus,
  registerUniversity,
} from "../controllers/universityController.js";
import universityAuth from "../middleware/universityAuth.js";

const router = express.Router();

router.post("/login", loginUniversity);
router.post("/request-approval", requestUniversityApproval);
router.post("/check-status", checkUniversityApprovalStatus);
router.post("/register", registerUniversity);
router.get("/me", universityAuth, getCurrentUniversityUser);
router.post("/logout", universityAuth, logoutUniversity);

export default router;
