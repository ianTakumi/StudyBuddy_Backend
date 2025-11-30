import express from "express";
import {
  getStudySessions,
  getStudySessionById,
  createStudySession,
  updateStudySession,
  deleteStudySession,
} from "../controllers/study-session.controller.js";

const router = express.Router();

// GET /api/study-sessions/:userId - Get all study sessions for user
router.get("/:userId", getStudySessions);

// GET /api/study-sessions/session/:id - Get single study session
router.get("/session/:id", getStudySessionById);

// POST /api/study-sessions - Create new study session
router.post("/", createStudySession);

// PUT /api/study-sessions/:id - Update study session
router.put("/:id", updateStudySession);

// DELETE /api/study-sessions/:id - Delete study session
router.delete("/:id", deleteStudySession);

export default router;
