import express from "express";
import {
  getProposalsForIssue,
  selectUniversityProposal,
} from "../controllers/governmentProposalController.js";
import governmentAuth from "../middleware/governmentAuth.js";

const router = express.Router();

router.use(governmentAuth);

router.get("/issue/:issueId", getProposalsForIssue);
router.post("/:proposalId/select", selectUniversityProposal);

export default router;
