import express from "express";
import {
  getApprovedIssuesForUniversity,
  submitProposal,
  getMyProposals,
  getProposalById,
} from "../controllers/universityProposalController.js";
import universityAuth from "../middleware/universityAuth.js";

const router = express.Router();

router.use(universityAuth);

router.get("/issues/approved", getApprovedIssuesForUniversity);
router.post("/", submitProposal);
router.get("/my", getMyProposals);
router.get("/:proposalId", getProposalById);

export default router;
