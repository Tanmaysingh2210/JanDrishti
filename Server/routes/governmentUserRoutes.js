import express from "express";

import {
  createGovernmentUser,
  getGovernmentUsers,
  getGovernmentUserById,
  updateGovernmentUser,
  toggleGovernmentUserStatus,
} from "../controllers/governmentUserController.js";

import governmentAuth from "../middleware/governmentAuth.js";

const router = express.Router();

router.post(
  "/",
  // governmentAuth,
  createGovernmentUser
);

router.get(
  "/",
  governmentAuth,
  getGovernmentUsers
);

router.get(
  "/:userId",
  governmentAuth,
  getGovernmentUserById
);

router.put(
  "/:userId",
  governmentAuth,
  updateGovernmentUser
);

router.patch(
  "/:userId/status",
  governmentAuth,
  toggleGovernmentUserStatus
);

export default router;