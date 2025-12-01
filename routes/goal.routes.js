import express from "express";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  toggleGoal,
} from "../controllers/goals.controller.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected and user-specific
router.get("/:userId", getGoals);
router.post("/:userId", createGoal);
router.put("/:goalId", updateGoal);
router.patch("/:goalId/toggle", toggleGoal);
router.delete("/:goalId", deleteGoal);

export default router;
