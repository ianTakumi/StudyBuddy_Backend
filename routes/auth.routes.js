// routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
// import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Registration
router.post("/register", register);

// Login
router.post("/login", login);

// Logout
router.post("/logout", logout);

// Get user profile
router.get("/profile", getProfile);

// Refresh token
router.post("/refresh-token", refreshToken);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

export default router;
