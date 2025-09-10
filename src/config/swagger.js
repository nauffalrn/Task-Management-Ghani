import { fileURLToPath } from "url";
import { dirname } from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description:
        "A comprehensive task management system API with role-based access control",
      contact: {
        name: "API Support",
        email: "support@gmi.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
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
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        ForbiddenError: {
          description: "Insufficient permissions",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              example: "An error occurred",
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
              example: "Operation successful",
            },
            data: {
              type: "object",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: {
              type: "string",
              enum: [
                "owner",
                "manager",
                "head_it",
                "head_marketing",
                "head_finance",
                "staff_it",
                "staff_marketing",
                "staff_finance",
              ],
              example: "staff_it",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Workspace: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "IT Department",
            },
            description: {
              type: "string",
              example: "IT Department workspace",
            },
            owner_id: {
              type: "integer",
              example: 1,
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            workspace_id: {
              type: "integer",
              example: 1,
            },
            title: {
              type: "string",
              example: "Complete project documentation",
            },
            description: {
              type: "string",
              example: "Create comprehensive documentation for the project",
            },
            status: {
              type: "string",
              enum: ["todo", "in_progress", "done"],
              example: "todo",
            },
            assigned_to: {
              type: "integer",
              example: 2,
            },
            created_by: {
              type: "integer",
              example: 1,
            },
            due_date: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            task_id: {
              type: "integer",
              example: 1,
            },
            user_id: {
              type: "integer",
              example: 1,
            },
            content: {
              type: "string",
              example: "This is a comment on the task",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Attachment: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            task_id: {
              type: "integer",
              example: 1,
            },
            filename: {
              type: "string",
              example: "document.pdf",
            },
            original_name: {
              type: "string",
              example: "project_document.pdf",
            },
            mime_type: {
              type: "string",
              example: "application/pdf",
            },
            file_size: {
              type: "integer",
              example: 1024000,
            },
            file_path: {
              type: "string",
              example: "/uploads/tasks/document.pdf",
            },
            uploaded_by: {
              type: "integer",
              example: 1,
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Member: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            workspace_id: {
              type: "integer",
              example: 1,
            },
            user_id: {
              type: "integer",
              example: 2,
            },
            role: {
              type: "string",
              example: "member",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Log: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            workspace_id: {
              type: "integer",
              example: 1,
            },
            user_id: {
              type: "integer",
              example: 1,
            },
            action: {
              type: "string",
              example: "created_task",
            },
            entity_type: {
              type: "string",
              example: "task",
            },
            entity_id: {
              type: "integer",
              example: 1,
            },
            details: {
              type: "object",
              example: { task_title: "New Task" },
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
  },
  apis: ["./src/modules/**/*.routes.js", "./src/modules/**/*.controller.js"],
};

const specs = swaggerJsdoc(options);

// SIMPLE SWAGGER OPTIONS - NO CUSTOM CSS
const swaggerOptions = {
  customSiteTitle: "Task Management API Documentation",
  swaggerOptions: {
    persistAuthorization: true, // PENTING: Persist auth state
    docExpansion: "none",
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
  },
};

export { specs };
export { swaggerOptions };
export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(specs, swaggerOptions);
