import express from "express";

import {
  registerUniversity,
} from "../controllers/universityController.js";
import universityAuth from "../middleware/universityAuth.js";
const router = express.Router();


// =====================================================
// UNIVERSITY REGISTRATION
// =====================================================

// Public university registration
router.post(
  "/register",
  registerUniversity
);


export default router;