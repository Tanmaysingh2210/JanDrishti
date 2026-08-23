import express from "express";

import {
  registerUniversity,
  getAllUniversities,
  approveUniversity,
} from "../controllers/universityController.js";

const router = express.Router();


// =====================================================
// UNIVERSITY ROUTES
// =====================================================

// Public university registration
router.post("/register", registerUniversity);

// Get all registered universities
router.get("/", getAllUniversities);
router.get("", getAllUniversities);

// Approve university
router.put("/:id/approve", approveUniversity);
router.put("/approve/:id", approveUniversity);


export default router;
