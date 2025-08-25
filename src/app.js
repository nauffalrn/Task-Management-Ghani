import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler, notFound } from "./common/middlewares/error.js";

// Import routes
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import workspacesRoutes from "./modules/workspaces/workspaces.routes.js";
import membersRoutes from "./modules/members/members.routes.js";
import tasksRoutes from "./modules/tasks/tasks.routes.js";
import commentsRoutes from "./modules/comments/comments.routes.js";
import attachmentsRoutes from "./modules/attachments/attachments.routes.js";
import logsRoutes from "./modules/logs/logs.routes.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Logging
app.use(morgan("combined"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/workspaces", workspacesRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/attachments", attachmentsRoutes);
app.use("/api/logs", logsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
