import express from "express";
import {
  loginUniversity,
  getCurrentUniversityUser,
  logoutUniversity,
} from "../controllers/universityAuthController.js";
import universityAuth from "../middleware/universityAuth.js";

const router = express.Router();

router.post("/login", loginUniversity);
router.get("/me", universityAuth, getCurrentUniversityUser);
router.post("/logout", universityAuth, logoutUniversity);

export default router;
