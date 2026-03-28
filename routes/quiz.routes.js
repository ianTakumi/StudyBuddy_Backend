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
  getTeacherQuizCount,
  getClassQuizCount,
  getClassAverageScore,
  getQuizAverageScore,
} from "../controllers/quiz.controller.js";

const router = express.Router();

router.get("/class/:classId/average", getClassAverageScore);

router.get("/quiz/:quizId/average", getQuizAverageScore);

// Get total quizzes created by a teacher
router.get("/teacher/:teacherId/count", getTeacherQuizCount);

// Get total quizzes for a class
router.get("/class/:classId/count", getClassQuizCount);

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
