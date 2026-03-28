// routes/userRoutes.js
import express from "express";
import {
  updateProfile,
  getUserStats,
  getDashboard,
  getUsers,
  deleteUser,
} from "../controllers/user.controller.js";
// import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all users
router.get("/", getUsers);

// Update user profile
router.put("/profile/:userId", updateProfile);

// Delete user
router.delete("/:userId", deleteUser);

// Get user statistics
router.get("/stats", getUserStats);

// Get user dashboard data
router.get("/dashboard", getDashboard);

export default router;
