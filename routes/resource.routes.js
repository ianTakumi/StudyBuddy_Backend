// routes/resourceRoutes.js
import express from "express";
import {
  createResource,
  getResources,
  updateResource,
  deleteResource,
} from "../controllers/resource.controller.js";
// import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createResource);
router.get("/", getResources);
router.put("/:id", updateResource);
router.delete("/:id", deleteResource);

export default router;
