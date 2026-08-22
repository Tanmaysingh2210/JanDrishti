import express from "express";

import {
  getGovernmentProfile,
  updateGovernmentProfile,
  createGovernment,
} from "../controllers/governmentController.js";

import governmentAuth from "../middleware/governmentAuth.js";

const router = express.Router();

// Create new Government organization document
router.post(
  "/",
  createGovernment
);

// Get Government organization profile
router.get(
  "/profile",
  governmentAuth,
  getGovernmentProfile
);

// Update Government organization profile
router.put(
  "/profile",
  governmentAuth,
  updateGovernmentProfile
);

export default router;