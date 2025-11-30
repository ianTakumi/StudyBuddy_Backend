// routes/progressRoutes.js
import express from "express";
import {
  createStudySession,
  getStudySessions,
  getProgressStats,
} from "../controllers/progress.controller.js";
// import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/sessions", createStudySession);
router.get("/sessions", getStudySessions);
router.get("/stats", getProgressStats);

export default router;
