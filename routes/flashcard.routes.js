// routes/flashcardRoutes.js
import express from "express";
import {
  createFlashcardSet,
  getFlashcardSets,
  studyFlashcards,
} from "../controllers/flashcard.controller.js";
// import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/sets", createFlashcardSet);
router.get("/sets", getFlashcardSets);
router.post("/study", studyFlashcards);

export default router;
