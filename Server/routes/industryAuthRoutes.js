import express from "express";

import {
  registerIndustry,
  loginIndustry,
  getCurrentIndustry,
  logoutIndustry,
} from "../controllers/industryAuthController.js";

import industryAuth from "../middleware/industryAuth.js";

const router = express.Router();

router.post(
  "/register",
  registerIndustry
);

router.post(
  "/login",
  loginIndustry
);

router.get(
  "/me",
  industryAuth,
  getCurrentIndustry
);

router.post(
  "/logout",
  industryAuth,
  logoutIndustry
);

export default router;