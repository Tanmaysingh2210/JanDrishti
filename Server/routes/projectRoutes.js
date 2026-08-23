import express from "express";
import {
  getUniversityProjects,
  getProjectById,
  addProjectMilestone,
  updateMilestoneStatus,
  addProjectUpdate,
  getGovernmentProjects,
} from "../controllers/projectController.js";
import universityAuth from "../middleware/universityAuth.js";
import governmentAuth from "../middleware/governmentAuth.js";

const router = express.Router();

// University Routes
router.get("/university/my", universityAuth, getUniversityProjects);
router.get("/:projectId", getProjectById);
router.post("/:projectId/milestones", universityAuth, addProjectMilestone);
router.patch(
  "/:projectId/milestones/:milestoneId",
  universityAuth,
  updateMilestoneStatus
);
router.post("/:projectId/updates", addProjectUpdate);

// Government Routes
router.get("/government/all", governmentAuth, getGovernmentProjects);
router.get("/government/:projectId", governmentAuth, getProjectById);

export default router;
