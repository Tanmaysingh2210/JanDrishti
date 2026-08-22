import express from "express";

import {
  createDepartment,
  getDepartments,
  getActiveDepartments,
  getDepartmentById,
  updateDepartment,
  toggleDepartmentStatus,
} from "../controllers/departmentController.js";

import universityAuth from "../middleware/universityAuth.js";

const router = express.Router();


// =====================================================
// DEPARTMENTS
// =====================================================

// Create
router.post(
  "/",
  universityAuth,
  createDepartment
);


// Get all
router.get(
  "/",
  universityAuth,
  getDepartments
);


// Get active
router.get(
  "/active",
  universityAuth,
  getActiveDepartments
);


// Get one
router.get(
  "/:departmentId",
  universityAuth,
  getDepartmentById
);


// Update
router.put(
  "/:departmentId",
  universityAuth,
  updateDepartment
);


// Activate / deactivate
router.patch(
  "/:departmentId/status",
  universityAuth,
  toggleDepartmentStatus
);


export default router;