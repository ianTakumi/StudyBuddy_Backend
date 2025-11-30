// routes/quizRoutes.js
import express from "express";
import {
  createQuiz,
  getQuizzes,
  attemptQuiz,
  getQuizAttempts,
} from "../controllers/quiz.controller.js";
// import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/", createQuiz);
router.get("/", getQuizzes);
router.post("/attempt", attemptQuiz);
router.get("/attempts", getQuizAttempts);

export default router;
