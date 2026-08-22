import express from "express";

import {
  loginGovernment,
  getCurrentGovernmentUser,
  logoutGovernment,
} from "../controllers/governmentAuthController.js";

import governmentAuth from "../middleware/governmentAuth.js";

const router = express.Router();

router.post(
  "/login",
  loginGovernment
);

router.get(
  "/me",
  governmentAuth,
  getCurrentGovernmentUser
);

router.post(
  "/logout",
  governmentAuth,
  logoutGovernment
);

export default router;