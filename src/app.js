import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { errorHandler, notFound } from "./common/middlewares/error.js";
import { handleUploadError } from "./common/middlewares/upload.js";
import { specs, swaggerUiOptions } from "./config/swagger.js"; // ✅ Import swaggerUiOptions
import path from "path";
import { fileURLToPath } from "url";

// Import routes - urutan ini menentukan urutan di Swagger
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import workspacesRoutes from "./modules/workspaces/workspaces.routes.js";
import membersRoutes from "./modules/members/members.routes.js";
import tasksRoutes from "./modules/tasks/tasks.routes.js";
import attachmentsRoutes from "./modules/attachments/attachments.routes.js";
import commentsRoutes from "./modules/comments/comments.routes.js";
import logsRoutes from "./modules/logs/logs.routes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

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

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public", "uploads"))
);

app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ✅ Root endpoint dengan link ke dokumentasi
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Task Management API is running!",
    documentation: "http://localhost:5000/api-docs",
    health: "http://localhost:5000/health",
    version: "1.0.0",
  });
});

// ✅ Swagger Documentation - gunakan swaggerUiOptions dari config
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// API Routes - urutan ini juga harus sama dengan urutan yang diinginkan
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/workspaces", workspacesRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/attachments", attachmentsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/logs", logsRoutes);

// Upload error handling
app.use(handleUploadError);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
