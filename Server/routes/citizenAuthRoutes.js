import express from "express";

import {
  registerCitizen,
  loginCitizen,
  getCurrentCitizen,
  logoutCitizen,
} from "../controllers/citizenAuthController.js";
import citizenAuth from "../middleware/citizenAuth.js";
const router = express.Router();

router.post(
  "/register",
  registerCitizen
);

router.post(
  "/login",
  loginCitizen
);

router.get(
  "/me",
  citizenAuth,
  getCurrentCitizen
);

router.post(
  "/logout",
  citizenAuth,
  logoutCitizen
);


export default router;