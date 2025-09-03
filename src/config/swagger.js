import { fileURLToPath } from "url";
import { dirname, join } from "path";
import swaggerJSDoc from "swagger-jsdoc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description:
        "A comprehensive task management system API with workspace collaboration features",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique user identifier",
              example: 1,
            },
            username: {
              type: "string",
              description: "Unique username",
              example: "john_doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "john.doe@company.com",
            },
            fullName: {
              type: "string",
              description: "User's full name",
              example: "John Doe",
            },
            role: {
              type: "string",
              enum: ["owner", "manager", "employee"],
              description: "User role in the system",
              example: "employee",
            },
            department: {
              type: "string",
              description: "User's department",
              example: "Engineering",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
              example: "2024-08-28T10:30:00.000Z",
            },
          },
        },
        Workspace: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique workspace identifier",
              example: 1,
            },
            name: {
              type: "string",
              description: "Workspace name",
              example: "Product Development",
            },
            description: {
              type: "string",
              description: "Workspace description",
              example: "Main workspace for product development team",
            },
            createdBy: {
              type: "integer",
              description: "ID of the user who created the workspace",
              example: 1,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Workspace creation timestamp",
              example: "2024-08-28T10:30:00.000Z",
            },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique task identifier",
              example: 1,
            },
            title: {
              type: "string",
              description: "Task title",
              example: "Fix login authentication bug",
            },
            description: {
              type: "string",
              description: "Detailed task description",
              example:
                "Fix the JWT authentication issue that prevents users from logging in",
            },
            status: {
              type: "string",
              enum: ["todo", "in_progress", "done"],
              description: "Current task status",
              example: "in_progress",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
              description: "Task priority level",
              example: "high",
            },
            workspaceId: {
              type: "integer",
              description: "ID of the workspace containing this task",
              example: 1,
            },
            assignedTo: {
              type: "integer",
              description: "ID of the user assigned to this task",
              example: 6,
            },
            createdBy: {
              type: "integer",
              description: "ID of the user who created this task",
              example: 1,
            },
            dueDate: {
              type: "string",
              format: "date-time",
              description: "Task due date",
              example: "2024-12-31T23:59:59.000Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Task creation timestamp",
              example: "2024-08-28T10:30:00.000Z",
            },
          },
        },
        Member: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique member identifier",
              example: 1,
            },
            workspaceId: {
              type: "integer",
              description: "ID of the workspace",
              example: 1,
            },
            userId: {
              type: "integer",
              description: "ID of the user",
              example: 6,
            },
            role: {
              type: "string",
              enum: ["admin", "member"],
              description: "Member role in the workspace",
              example: "member",
            },
            addedBy: {
              type: "integer",
              description: "ID of the user who added this member",
              example: 1,
            },
            joinedAt: {
              type: "string",
              format: "date-time",
              description: "Member join timestamp",
              example: "2024-08-28T10:30:00.000Z",
            },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique comment identifier",
              example: 1,
            },
            content: {
              type: "string",
              description: "Comment text content",
              example:
                "I've started working on this task. Will update progress by EOD.",
            },
            taskId: {
              type: "integer",
              description: "ID of the task this comment belongs to",
              example: 1,
            },
            userId: {
              type: "integer",
              description: "ID of the user who wrote the comment",
              example: 6,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Comment creation timestamp",
              example: "2024-08-28T10:30:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Comment last update timestamp",
              example: "2024-08-28T11:15:00.000Z",
            },
          },
        },
        Attachment: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique attachment identifier",
              example: 1,
            },
            fileName: {
              type: "string",
              description: "Original filename",
              example: "bug-screenshot.png",
            },
            filePath: {
              type: "string",
              description: "Server file path",
              example: "/uploads/attachments/1234567890-bug-screenshot.png",
            },
            fileSize: {
              type: "integer",
              description: "File size in bytes",
              example: 2048000,
            },
            fileType: {
              type: "string",
              description: "MIME type of the file",
              example: "image/png",
            },
            description: {
              type: "string",
              description: "Optional file description",
              example: "Screenshot showing the login bug",
            },
            taskId: {
              type: "integer",
              description: "ID of the task this attachment belongs to",
              example: 1,
            },
            uploadedBy: {
              type: "integer",
              description: "ID of the user who uploaded the file",
              example: 6,
            },
            uploadedAt: {
              type: "string",
              format: "date-time",
              description: "File upload timestamp",
              example: "2024-08-28T10:30:00.000Z",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Resource not found",
            },
            error: {
              type: "string",
              description: "Error details",
              example: "The requested resource could not be found",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
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
  apis: [
    join(__dirname, "../modules/**/*.routes.js"),
    join(__dirname, "../modules/**/*.controller.js"),
  ],
};

const specs = swaggerJSDoc(options);

const swaggerUiOptions = {
  customCssUrl: ["/public/swagger/global.css"],
  customJs: "/public/swagger/swagger.js",
  customSiteTitle: "Task Management API",
  customfavIcon: "/public/logo.png",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: false,
    showExtensions: false,
    showCommonExtensions: false,
    docExpansion: "none",
    defaultModelsExpandDepth: -1,
    defaultModelExpandDepth: -1,
    url: undefined,
    urls: undefined
  },
};

export { specs, swaggerUiOptions };
