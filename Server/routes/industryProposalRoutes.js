import express from "express";
import {
  getAssignedProjectsForIndustry,
  submitSupportProposal,
  getMyIndustryProposals,
} from "../controllers/industryProposalController.js";
import {
  getIndustryProposalsForUniversity,
  reviewIndustryProposal,
} from "../controllers/universityIndustryProposalController.js";
import industryAuth from "../middleware/industryAuth.js";
import universityAuth from "../middleware/universityAuth.js";

const router = express.Router();

// Industry Endpoints
router.get("/projects", industryAuth, getAssignedProjectsForIndustry);
router.post("/", industryAuth, submitSupportProposal);
router.get("/my", industryAuth, getMyIndustryProposals);

// University Review Endpoints for Industry Proposals
router.get(
  "/university/received",
  universityAuth,
  getIndustryProposalsForUniversity
);
router.patch(
  "/university/:proposalId/status",
  universityAuth,
  reviewIndustryProposal
);

export default router;
