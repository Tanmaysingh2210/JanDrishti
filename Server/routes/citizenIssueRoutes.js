import express from "express";
import {
  submitIssue,
  getMyIssues,
  getCitizenIssueById,
  uploadEvidence,
  classifyIssue,
} from "../controllers/citizenIssueController.js";
import citizenAuth from "../middleware/citizenAuth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/evidence",
  upload.single("file"),
  uploadEvidence
);

// AI classification — no auth required (public endpoint)
router.post("/classify", classifyIssue);

router.use(citizenAuth);

router.post("/", submitIssue);
router.get("/my", getMyIssues);
router.get("/:issueId", getCitizenIssueById);

export default router;
