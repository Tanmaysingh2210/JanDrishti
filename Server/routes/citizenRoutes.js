import express from "express";

import {
  updateCitizenLocation,
} from "../controllers/citizenController.js";

import citizenAuth from "../middleware/citizenAuth.js";

const router = express.Router();

router.patch(
  "/location",
  citizenAuth,
  updateCitizenLocation
);

export default router;