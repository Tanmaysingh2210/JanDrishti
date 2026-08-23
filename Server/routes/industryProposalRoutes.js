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

const router = express.Router();

// Industry Opportunities & Proposals Endpoints
router.get("/projects", getAssignedProjectsForIndustry);
router.get("/opportunities", getAssignedProjectsForIndustry);
router.post("/", submitSupportProposal);
router.post("/submit", submitSupportProposal);
router.get("/my", getMyIndustryProposals);
router.get("/all", getMyIndustryProposals);

// University Review Endpoints for Industry Proposals
router.get("/university/received", getIndustryProposalsForUniversity);
router.patch("/university/:proposalId/status", reviewIndustryProposal);
router.post("/university/:proposalId/review", reviewIndustryProposal);

export default router;
