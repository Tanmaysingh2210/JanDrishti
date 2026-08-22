import express from "express";
import {
  submitIssue,
  getMyIssues,
  getCitizenIssueById,
} from "../controllers/citizenIssueController.js";
import citizenAuth from "../middleware/citizenAuth.js";

const router = express.Router();

router.use(citizenAuth);

router.post("/", submitIssue);
router.get("/my", getMyIssues);
router.get("/:issueId", getCitizenIssueById);

export default router;
