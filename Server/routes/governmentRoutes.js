import express from "express";

import {
  getGovernmentProfile,
  updateGovernmentProfile,
} from "../controllers/governmentController.js";

import governmentAuth from "../middleware/governmentAuth.js";

const router = express.Router();

router.get(
  "/profile",
  governmentAuth,
  getGovernmentProfile
);

router.put(
  "/profile",
  governmentAuth,
  updateGovernmentProfile
);

export default router;