import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

// Import middlewares
import { errorHandler, notFoundHandler } from "./common/middlewares/error.js";

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

// Middlewares
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use(
  "/swagger-assets",
  express.static(path.join(__dirname, "../public/swagger"))
);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description:
        "A comprehensive task management system API with role-based access control",
      contact: {
        name: "API Support",
        email: "support@taskmanagement.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: "Development server",
      },
      {
        url: "https://api.taskmanagement.com/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token in the format: Bearer <token>",
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "error",
                  },
                  message: {
                    type: "string",
                    example: "Unauthorized",
                  },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: "Insufficient permissions",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "error",
                  },
                  message: {
                    type: "string",
                    example: "Forbidden",
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "error",
                  },
                  message: {
                    type: "string",
                    example: "Resource not found",
                  },
                },
              },
            },
          },
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "error",
                  },
                  message: {
                    type: "string",
                    example: "Validation error",
                  },
                  details: {
                    type: "object",
                    description: "Detailed validation errors",
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Workspaces",
        description: "Workspace management endpoints",
      },
      {
        name: "Tasks",
        description: "Task management endpoints",
      },
      {
        name: "Comments",
        description: "Comment management endpoints",
      },
      {
        name: "Attachments",
        description: "File attachment endpoints",
      },
      {
        name: "Members",
        description: "Workspace member management endpoints",
      },
      {
        name: "Logs",
        description: "Activity log endpoints",
      },
    ],
  },
  apis: ["./src/modules/*/routes/*.js", "./src/modules/*/*.routes.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI with custom CSS
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 15px; border-radius: 5px; }
    `,
    customSiteTitle: "Task Management API Documentation",
    customfavIcon: "/logo.png",
  })
);

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
    message: "Task Management API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// API Info endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Task Management API",
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
