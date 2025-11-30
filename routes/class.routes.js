import express from "express";
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  generateNewClassCode,
  getClassStudents,
  removeStudentFromClass,
  joinClassWithCode,
  getStudentClasses,
  getClassStudentsForStudent,
} from "../controllers/class.controller.js";

const router = express.Router();

router.get("/:studentId/:classId/classmates", getClassStudentsForStudent);

// GET /api/classes/:teacherId - Get all classes for teacher
router.get("/:teacherId", getClasses);

// GET /api/classes/:teacherId/:id - Get single class by ID
router.get("/:teacherId/:id", getClassById);

// POST /api/classes/:teacherId - Create new class
router.post("/:teacherId", createClass);

// PUT /api/classes/:teacherId/:id - Update class
router.put("/:teacherId/:id", updateClass);

// DELETE /api/classes/:teacherId/:id - Delete class
router.delete("/:teacherId/:id", deleteClass);

// Class code management
router.post("/:teacherId/:id/generate-code", generateNewClassCode);

// Student management
router.get("/:teacherId/:id/students", getClassStudents);
router.delete("/:teacherId/:id/students/:studentId", removeStudentFromClass);

// Student classes and joining
router.get("/students/:studentId/classes", getStudentClasses);
router.post("/students/:studentId/join-class", joinClassWithCode);

export default router;
