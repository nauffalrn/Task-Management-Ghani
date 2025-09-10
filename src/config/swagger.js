import { fileURLToPath } from "url";
import { dirname, join } from "path";
import swaggerJsdoc from "swagger-jsdoc";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GMI Task Management API",
      version: "1.0.0",
      description:
        "A comprehensive task management system API with role-based access control",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Local development server",
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
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        ForbiddenError: {
          description: "Insufficient permissions",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ValidationErrorResponse",
              },
            },
          },
        },
        SuccessResponse: {
          description: "Operation successful",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessResponse",
              },
            },
          },
        },
      },
      schemas: {
        // === AUTHENTICATION SCHEMAS ===
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
              example: "manager@gmi.com",
            },
            password: {
              type: "string",
              minLength: 6,
              description: "User's password",
              example: "aaaaaaaa",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password", "role"],
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              description: "User's full name",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
              example: "john@gmi.com",
            },
            password: {
              type: "string",
              minLength: 6,
              description: "User's password",
              example: "password123",
            },
            role: {
              $ref: "#/components/schemas/UserRole",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            message: {
              type: "string",
              example: "Login successful",
            },
            data: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  description: "JWT access token",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                user: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
        },

        // === USER SCHEMAS ===
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
              $ref: "#/components/schemas/UserRole",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "User creation timestamp",
              example: "2025-09-08T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "User last update timestamp",
              example: "2025-09-08T10:00:00.000Z",
            },
          },
        },
        UserRole: {
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
          description: "User's role in the system",
          example: "staff_marketing",
        },
        CreateUserRequest: {
          type: "object",
          required: ["name", "email", "password", "role"],
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              description: "User's full name",
              example: "Jane Smith",
            },
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
              example: "jane@gmi.com",
            },
            password: {
              type: "string",
              minLength: 6,
              description: "User's password",
              example: "password123",
            },
            role: {
              $ref: "#/components/schemas/UserRole",
            },
          },
        },
        UpdateUserRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              description: "User's full name",
              example: "Jane Smith Updated",
            },
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
              example: "jane.updated@gmi.com",
            },
            role: {
              $ref: "#/components/schemas/UserRole",
            },
          },
        },

        // === WORKSPACE SCHEMAS ===
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
              example: "IT Department",
            },
            description: {
              type: "string",
              description: "Workspace description",
              example: "IT workspace for system development and maintenance",
            },
            createdBy: {
              type: "integer",
              description: "ID of user who created the workspace",
              example: 1,
            },
            creator: {
              $ref: "#/components/schemas/User",
            },
            memberCount: {
              type: "integer",
              description: "Number of members in workspace",
              example: 5,
            },
            taskCount: {
              type: "integer",
              description: "Number of tasks in workspace",
              example: 12,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Workspace creation timestamp",
              example: "2025-09-08T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Workspace last update timestamp",
              example: "2025-09-08T10:00:00.000Z",
            },
          },
        },
        CreateWorkspaceRequest: {
          type: "object",
          required: ["name", "description"],
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              description: "Workspace name",
              example: "Marketing Campaign 2025",
            },
            description: {
              type: "string",
              maxLength: 500,
              description: "Workspace description",
              example:
                "Marketing workspace for campaign activities and content creation",
            },
          },
        },
        UpdateWorkspaceRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              description: "Workspace name",
              example: "Updated Workspace Name",
            },
            description: {
              type: "string",
              maxLength: 500,
              description: "Workspace description",
              example: "Updated workspace description",
            },
          },
        },

        // === TASK SCHEMAS ===
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
              example: "Develop Login System",
            },
            description: {
              type: "string",
              description: "Task description",
              example: "Create secure login system with JWT authentication",
            },
            workspaceId: {
              type: "integer",
              description: "ID of workspace this task belongs to",
              example: 1,
            },
            workspace: {
              $ref: "#/components/schemas/Workspace",
            },
            assigneeId: {
              type: "integer",
              description: "ID of user assigned to this task",
              example: 2,
            },
            assignee: {
              $ref: "#/components/schemas/User",
            },
            priority: {
              $ref: "#/components/schemas/TaskPriority",
            },
            status: {
              $ref: "#/components/schemas/TaskStatus",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              description: "Task due date",
              example: "2025-12-31T23:59:59.000Z",
            },
            attachmentCount: {
              type: "integer",
              description: "Number of attachments",
              example: 3,
            },
            commentCount: {
              type: "integer",
              description: "Number of comments",
              example: 5,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Task creation timestamp",
              example: "2025-09-08T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Task last update timestamp",
              example: "2025-09-08T10:00:00.000Z",
            },
          },
        },
        TaskPriority: {
          type: "string",
          enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
          description: "Task priority level",
          example: "HIGH",
        },
        TaskStatus: {
          type: "string",
          enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
          description: "Task status",
          example: "PENDING",
        },
        CreateTaskRequest: {
          type: "object",
          required: [
            "title",
            "description",
            "workspaceId",
            "priority",
            "dueDate",
          ],
          properties: {
            title: {
              type: "string",
              minLength: 2,
              maxLength: 200,
              description: "Task title",
              example: "Implement Database Schema",
            },
            description: {
              type: "string",
              maxLength: 1000,
              description: "Task description",
              example:
                "Design and implement database schema for user management system",
            },
            workspaceId: {
              type: "integer",
              description: "ID of workspace this task belongs to",
              example: 1,
            },
            assigneeId: {
              type: "integer",
              description: "ID of user to assign this task to",
              example: 2,
            },
            priority: {
              $ref: "#/components/schemas/TaskPriority",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              description: "Task due date",
              example: "2025-12-31T23:59:59.000Z",
            },
          },
        },
        UpdateTaskRequest: {
          type: "object",
          properties: {
            title: {
              type: "string",
              minLength: 2,
              maxLength: 200,
              description: "Task title",
              example: "Updated task title",
            },
            description: {
              type: "string",
              maxLength: 1000,
              description: "Task description",
              example: "Updated task description",
            },
            assigneeId: {
              type: "integer",
              description: "ID of user to assign this task to",
              example: 3,
            },
            priority: {
              $ref: "#/components/schemas/TaskPriority",
            },
            status: {
              $ref: "#/components/schemas/TaskStatus",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              description: "Task due date",
              example: "2025-12-31T23:59:59.000Z",
            },
          },
        },

        // === COMMENT SCHEMAS ===
        Comment: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Comment ID",
              example: 1,
            },
            content: {
              type: "string",
              description: "Comment content",
              example: "This task looks good, let's proceed",
            },
            taskId: {
              type: "integer",
              description: "ID of task this comment belongs to",
              example: 1,
            },
            task: {
              $ref: "#/components/schemas/Task",
            },
            userId: {
              type: "integer",
              description: "ID of user who wrote this comment",
              example: 2,
            },
            user: {
              $ref: "#/components/schemas/User",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Comment creation timestamp",
              example: "2025-09-08T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Comment last update timestamp",
              example: "2025-09-08T10:00:00.000Z",
            },
          },
        },
        CreateCommentRequest: {
          type: "object",
          required: ["content"],
          properties: {
            content: {
              type: "string",
              minLength: 1,
              maxLength: 1000,
              description: "Comment content",
              example: "Great work on this task!",
            },
          },
        },
        UpdateCommentRequest: {
          type: "object",
          required: ["content"],
          properties: {
            content: {
              type: "string",
              minLength: 1,
              maxLength: 1000,
              description: "Updated comment content",
              example: "Updated comment text",
            },
          },
        },

        // === ATTACHMENT SCHEMAS ===
        Attachment: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Attachment ID",
              example: 1,
            },
            filename: {
              type: "string",
              description: "Original filename",
              example: "banner_design.pdf",
            },
            originalName: {
              type: "string",
              description: "Original filename from upload",
              example: "Independence Day Banner.pdf",
            },
            path: {
              type: "string",
              description: "File path on server",
              example: "/uploads/tasks/1/banner_design.pdf",
            },
            mimetype: {
              type: "string",
              description: "File MIME type",
              example: "application/pdf",
            },
            size: {
              type: "integer",
              description: "File size in bytes",
              example: 2048576,
            },
            taskId: {
              type: "integer",
              description: "ID of task this attachment belongs to",
              example: 1,
            },
            task: {
              $ref: "#/components/schemas/Task",
            },
            uploadedBy: {
              type: "integer",
              description: "ID of user who uploaded this file",
              example: 2,
            },
            uploader: {
              $ref: "#/components/schemas/User",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Upload timestamp",
              example: "2025-09-08T10:00:00.000Z",
            },
          },
        },

        // === MEMBER SCHEMAS ===
        Member: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Member ID",
              example: 1,
            },
            workspaceId: {
              type: "integer",
              description: "Workspace ID",
              example: 1,
            },
            workspace: {
              $ref: "#/components/schemas/Workspace",
            },
            userId: {
              type: "integer",
              description: "User ID",
              example: 2,
            },
            user: {
              $ref: "#/components/schemas/User",
            },
            joinedAt: {
              type: "string",
              format: "date-time",
              description: "When user joined the workspace",
              example: "2025-09-08T10:00:00.000Z",
            },
          },
        },
        AddMemberRequest: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: {
              type: "integer",
              description: "ID of user to add to workspace",
              example: 2,
            },
          },
        },

        // === LOG SCHEMAS ===
        Log: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Log ID",
              example: 1,
            },
            action: {
              type: "string",
              description: "Action performed",
              example: "TASK_CREATED",
            },
            description: {
              type: "string",
              description: "Log description",
              example: "Task 'Design Banner' was created",
            },
            userId: {
              type: "integer",
              description: "ID of user who performed the action",
              example: 1,
            },
            user: {
              $ref: "#/components/schemas/User",
            },
            workspaceId: {
              type: "integer",
              description: "Workspace ID where action occurred",
              example: 1,
            },
            workspace: {
              $ref: "#/components/schemas/Workspace",
            },
            taskId: {
              type: "integer",
              description: "Task ID (if action relates to a task)",
              example: 1,
            },
            task: {
              $ref: "#/components/schemas/Task",
            },
            metadata: {
              type: "object",
              description: "Additional action metadata",
              example: {
                oldStatus: "PENDING",
                newStatus: "IN_PROGRESS",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Log timestamp",
              example: "2025-09-08T10:00:00.000Z",
            },
          },
        },

        // === PAGINATION SCHEMAS ===
        PaginationMeta: {
          type: "object",
          properties: {
            currentPage: {
              type: "integer",
              description: "Current page number",
              example: 1,
            },
            perPage: {
              type: "integer",
              description: "Items per page",
              example: 10,
            },
            totalItems: {
              type: "integer",
              description: "Total number of items",
              example: 45,
            },
            totalPages: {
              type: "integer",
              description: "Total number of pages",
              example: 5,
            },
            hasNext: {
              type: "boolean",
              description: "Whether there are more pages",
              example: true,
            },
            hasPrev: {
              type: "boolean",
              description: "Whether there are previous pages",
              example: false,
            },
          },
        },

        // === RESPONSE SCHEMAS ===
        SuccessResponse: {
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
        ErrorResponse: {
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
          },
        },
        ValidationErrorResponse: {
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
              example: {
                email: "Email is required",
                password: "Password must be at least 6 characters",
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/modules/*/routes/*.js", "./src/modules/*/*.routes.js"],
};

const specs = swaggerJsdoc(options);

// Load CSS file yang sudah ada
let customCss = "";
try {
  customCss = fs.readFileSync(
    join(__dirname, "../../public/swagger/global.css"),
    "utf8"
  );
} catch (error) {
  console.log("Could not load swagger CSS file:", error.message);
}

const swaggerOptions = {
  explorer: true,
  customSiteTitle: "GMI Task Management API Documentation",
  customfavIcon: "/logo.png",
  customCss: customCss,
  swaggerOptions: {
    docExpansion: "none",
    filter: true,
    persistAuthorization: true,
    tryItOutEnabled: true,
    supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
    operationsSorter: "alpha",
    tagsSorter: "alpha",
    defaultModelRendering: "model",
    displayRequestDuration: true,
    requestInterceptor: (req) => {
      console.log("Swagger Request:", req.url);
      return req;
    },
  },
};

export { specs, swaggerOptions };
