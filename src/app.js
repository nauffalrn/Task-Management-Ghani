import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";

// Import middlewares
import { notFoundHandler, errorHandler } from "./common/middlewares/error.js";

// Import Swagger config
import { swaggerServe, swaggerSetup } from "./config/swagger.js";

// Import routes
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import workspacesRoutes from "./modules/workspaces/workspaces.routes.js";
import tasksRoutes from "./modules/tasks/tasks.routes.js";
import commentsRoutes from "./modules/comments/comments.routes.js";
import membersRoutes from "./modules/members/members.routes.js";
import logsRoutes from "./modules/logs/logs.routes.js";
import attachmentsRoutes from "./modules/attachments/attachments.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enhanced CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5000", "http://127.0.0.1:5000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  })
);

app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files dengan path yang benar
app.use("/public", express.static(path.join(__dirname, "../public")));

// Serve logo.png secara langsung di root untuk Swagger
app.use(
  "/logo.png",
  express.static(path.join(__dirname, "../public/logo.png"))
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// API Documentation
app.use("/api-docs", swaggerServe, swaggerSetup);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/workspaces", workspacesRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/attachments", attachmentsRoutes);

// 404 handler untuk route yang tidak ditemukan
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
