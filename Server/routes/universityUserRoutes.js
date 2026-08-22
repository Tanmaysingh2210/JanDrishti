import express from "express";

import {
  createUniversityUser,
  getUniversityUsers,
  getUniversityUserById,
  updateUniversityUser,
  toggleUniversityUserStatus,
} from "../controllers/universityUserController.js";

import universityAuth from "../middleware/universityAuth.js";

const router = express.Router();


// =====================================================
// UNIVERSITY USERS
// =====================================================

// Create university user
router.post(
  "/",
  universityAuth,
  createUniversityUser
);


// Get all users of current university
router.get(
  "/",
  universityAuth,
  getUniversityUsers
);


// Get single user
router.get(
  "/:userId",
  universityAuth,
  getUniversityUserById
);


// Update user
router.put(
  "/:userId",
  universityAuth,
  updateUniversityUser
);


// Activate / deactivate user
router.patch(
  "/:userId/status",
  universityAuth,
  toggleUniversityUserStatus
);


export default router;