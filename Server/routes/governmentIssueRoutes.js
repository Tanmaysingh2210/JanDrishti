import express from "express";
import {
  getAllIssues,
  getIssueDetails,
  approveIssue,
  rejectIssue,
  mergeIssue,
} from "../controllers/governmentIssueController.js";
import governmentAuth from "../middleware/governmentAuth.js";

const router = express.Router();

router.use(governmentAuth);

router.get("/", getAllIssues);
router.get("/:issueId", getIssueDetails);
router.patch("/:issueId/approve", approveIssue);
router.patch("/:issueId/reject", rejectIssue);
router.post("/merge", mergeIssue);

export default router;
