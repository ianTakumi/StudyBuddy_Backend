// routes/userRoutes.js
import express from "express";
import {
  updateProfile,
  getUserStats,
  getDashboard,
} from "../controllers/user.controller.js";
// import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Update user profile
router.put("/profile/:userId", updateProfile);

// Get user statistics
router.get("/stats", getUserStats);

// Get user dashboard data
router.get("/dashboard", getDashboard);

export default router;
