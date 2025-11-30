import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import flashcardRoutes from "./routes/flashcard.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import userRoutes from "./routes/user.routes.js";
import classRoutes from "./routes/class.routes.js";
import studySession from "./routes/study-session.routes.js";
import quizTakingRoutes from "./routes/quizTaking.routes.js";

const app = express();

// Load environment variables
dotenv.config();

// Middleware - ALLOW ALL FOR TESTING
app.use(
  cors({
    origin: "*", // Allow all origins temporarily
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "StudyBuddy Server is running",
    clientIP: req.ip,
    clientHeaders: req.headers,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/study-sessions", studySession);
app.use("/api/quiz-taking", quizTakingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    availableRoutes: [
      "/api/health",
      "/api/auth/register",
      "/api/auth/login",
      "/api/flashcards",
      "/api/progress",
      "/api/quizzes",
      "/api/resources",
      "/api/users",
    ],
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server - LISTEN ON ALL NETWORK INTERFACES
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server is running and accessible from ANY device on your network`
  );
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Network: http://[YOUR_COMPUTER_IP]:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`⚠️  CORS: Allowing ALL origins for testing`);
});
