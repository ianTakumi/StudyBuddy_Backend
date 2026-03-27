import express from "express";
import {
  getFlashcardSets,
  getFlashcardSetById,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getAllFlashcardSets,
} from "../controllers/flashcard.controller.js";

const router = express.Router();

// Flashcard Sets Routes
// Get all flashcard sets for admin dashboard
router.get("/", getAllFlashcardSets);
router.get("/sets/:userId", getFlashcardSets);
router.get("/sets/single/:id", getFlashcardSetById);
router.post("/sets", createFlashcardSet);
router.put("/sets/:id", updateFlashcardSet);
router.delete("/sets/:id", deleteFlashcardSet);

// Flashcards Routes
router.post("/cards", createFlashcard);
router.put("/cards/:id", updateFlashcard);
router.delete("/cards/:id", deleteFlashcard);

export default router;
