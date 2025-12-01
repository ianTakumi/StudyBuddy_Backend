import express from "express";
import {
  submitContact,
  getContacts,
  updateContactStatus,
} from "../controllers/contact.controller.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route - anyone can submit contact form
router.post("/submit", submitContact);

// Protected routes - for admin only
router.get("/", getContacts);
router.patch("/:contactId/status", updateContactStatus);

export default router;
