import { fileURLToPath } from "url";
import { dirname, join } from "path";
import swaggerJsdoc from "swagger-jsdoc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ghani Task Management API",
      version: "1.0.0",
      description:
        "A comprehensive task management system API with role-based access control",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: "Development server",
      }
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
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "User ID",
              example: 1,
            },
            name: {
              type: "string",
              description: "User's full name",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
              example: "john@gmi.com",
            },
            role: {
              type: "string",
              enum: [
                "MANAGER",
                "HUMAS_HEAD",
                "ACARA_HEAD",
                "KONSUMSI_HEAD",
                "DEKORASI_HEAD",
                "KEAMANAN_HEAD",
                "HUMAS_STAFF",
                "ACARA_STAFF",
                "KONSUMSI_STAFF",
                "DEKORASI_STAFF",
                "KEAMANAN_STAFF",
              ],
              description: "User's role in the system",
              example: "HUMAS_STAFF",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "User creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "User last update timestamp",
            },
          },
        },
        Workspace: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Workspace ID",
              example: 1,
            },
            name: {
              type: "string",
              description: "Workspace name",
              example: "HUMAS Department",
            },
            description: {
              type: "string",
              description: "Workspace description",
              example: "HUMAS workspace for Independence Day project",
            },
            createdBy: {
              type: "integer",
              description: "ID of user who created the workspace",
              example: 1,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Workspace creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Workspace last update timestamp",
            },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Task ID",
              example: 1,
            },
            title: {
              type: "string",
              description: "Task title",
              example: "Design Independence Day Banner",
            },
            description: {
              type: "string",
              description: "Task description",
              example: "Create banner for Independence Day celebration",
            },
            workspaceId: {
              type: "integer",
              description: "ID of workspace this task belongs to",
              example: 1,
            },
            assigneeId: {
              type: "integer",
              description: "ID of user assigned to this task",
              example: 2,
            },
            priority: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
              description: "Task priority level",
              example: "HIGH",
            },
            status: {
              type: "string",
              enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
              description: "Task status",
              example: "PENDING",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              description: "Task due date",
              example: "2025-08-17T10:00:00.000Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Task creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Task last update timestamp",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              example: "Error description",
            },
            details: {
              type: "object",
              description: "Additional error details",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },
      },
    },
  },
  apis: ["./src/modules/*/routes/*.js", "./src/modules/*/*.routes.js"],
};

const specs = swaggerJsdoc(options);

// Enhanced Swagger UI options
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: "none",
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    persistAuthorization: true,
    defaultModelRendering: "model",
    displayOperationId: false,
    displayRequestDuration: true,
  },
  customCssUrl: "/swagger/global.css",
  customSiteTitle: "Ghani Task Management API Documentation",
  customfavIcon: "logo.png",
};

export { specs, swaggerOptions };
