import express from "express";
import {
  getQuizForTaking,
  submitQuiz,
  getQuizResults,
} from "../controllers/quiz.controller.js";

const router = express.Router();

// Quiz taking routes
router.get("/:quizId/take", getQuizForTaking); // Get quiz for student to take
router.post("/submit", submitQuiz); // Submit quiz answers
router.get("/:quizId/results/:studentId", getQuizResults); // Get quiz results

export default router;
