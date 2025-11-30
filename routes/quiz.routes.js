import express from "express";
import {
  createQuiz,
  getQuizzesByClass,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizSubmissions,
  getQuizQuestions,
  updateQuestion,
  getQuizzesByTeacher,
} from "../controllers/quiz.controller.js";

const router = express.Router();

// Class-specific quiz routes
router.post("/:classId", createQuiz);
router.get("/:classId", getQuizzesByClass);
router.get("/:classId/:quizId", getQuizById);
router.put("/:classId/:quizId", updateQuiz);
router.delete("/:classId/:quizId", deleteQuiz);
router.get("/:classId/:quizId/submissions", getQuizSubmissions);

// Question management routes
router.get("/:classId/:quizId/questions", getQuizQuestions);
router.put("/:classId/:quizId/questions/:questionId", updateQuestion);

// Teacher-specific routes
router.get("/teacher/:teacherId", getQuizzesByTeacher);

export default router;
