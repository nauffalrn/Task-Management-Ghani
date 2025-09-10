import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

// Import middlewares
import { errorHandler, notFoundHandler } from "./common/middlewares/error.js";

// Import Swagger config
import { specs, swaggerOptions } from "./config/swagger.js";

// Import routes
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import workspacesRoutes from "./modules/workspaces/workspaces.routes.js";
import tasksRoutes from "./modules/tasks/tasks.routes.js";
import commentsRoutes from "./modules/comments/comments.routes.js";
import attachmentsRoutes from "./modules/attachments/attachments.routes.js";
import membersRoutes from "./modules/members/members.routes.js";
import logsRoutes from "./modules/logs/logs.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enhanced CORS configuration for Swagger
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

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/swagger", express.static(path.join(__dirname, "../public/swagger")));

// Serve logo explicitly
app.use(express.static(path.join(__dirname, "../public")));

app.get("/logo.png", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/logo.png"));
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/workspaces", workspacesRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/attachments", attachmentsRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/logs", logsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Ghani Task Management API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// API Info endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Ghani Task Management API",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      workspaces: "/api/workspaces",
      tasks: "/api/tasks",
      comments: "/api/comments",
      attachments: "/api/attachments",
      members: "/api/members",
      logs: "/api/logs",
    },
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
