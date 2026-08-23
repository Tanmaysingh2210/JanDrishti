import express from "express";

import {
  registerUniversity,
  getAllUniversities,
  approveUniversity,
} from "../controllers/universityController.js";
import { getAllIssues } from "../controllers/governmentIssueController.js";

const router = express.Router();


// =====================================================
// UNIVERSITY ROUTES
// =====================================================

// Public university registration
router.post("/register", registerUniversity);

// Get all registered universities & challenges
router.get("/", getAllUniversities);
router.get("/all", getAllUniversities);
router.get("/challenges", getAllIssues);

// Approve university
router.put("/:id/approve", approveUniversity);
router.put("/approve/:id", approveUniversity);


export default router;
