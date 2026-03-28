import express from "express";
import {
  getAllFlashcardSetsForClass,
  getFlashcardSetsByClass,
  getFlashcardSetById,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getFlashcardsBySet,
  getTeacherFlashcardSets,
  countTeacherFlashcardSets,
  getClassFlashcardSetCount,
} from "../controllers/flashcard_class.controller.js";

const router = express.Router();

// Teacher dashboard - get all flashcard sets for classes the teacher is associated with
router.get("/count/:teacherId", countTeacherFlashcardSets);

// Get flashcard set count for a specific class
router.get("/class/:classId/count", getClassFlashcardSetCount);

router.get("/teacher/:teacherId", getTeacherFlashcardSets);

// Flashcard set admin
router.get("/", getAllFlashcardSetsForClass);

// Flashcard Sets Routes (Class-based)
// Get all flashcard sets for a specific class
router.get("/class/:classId", getFlashcardSetsByClass);

// Get single flashcard set by ID
router.get("/sets/:id", getFlashcardSetById);

// Create new flashcard set for a class
router.post("/class/:classId/sets", createFlashcardSet);

// Update flashcard set
router.put("/sets/:id", updateFlashcardSet);

// Delete flashcard set
router.delete("/sets/:id", deleteFlashcardSet);

// Flashcards Routes (within a set)
// Get all flashcards in a set
router.get("/sets/:setId/flashcards", getFlashcardsBySet);

// Create new flashcard in a set
router.post("/sets/:setId/flashcards", createFlashcard);

// Update flashcard
router.put("/flashcards/:id", updateFlashcard);

// Delete flashcard
router.delete("/flashcards/:id", deleteFlashcard);

export default router;
