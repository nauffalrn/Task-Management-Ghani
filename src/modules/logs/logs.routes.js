import { Router } from "express";
import { authenticateToken } from "../../common/middlewares/auth.js";
import { getLogs, getWorkspaceLogs, createLog } from "./logs.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Activity logging and audit trail endpoints
 */

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get logs with optional filters
 *     description: Get activity logs with optional workspace, user, task, or action filters
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         schema:
 *           type: integer
 *         description: Filter by workspace ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: integer
 *         description: Filter by task ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Logs retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       workspaceId:
 *                         type: integer
 *                       workspaceName:
 *                         type: string
 *                       taskId:
 *                         type: integer
 *                       taskTitle:
 *                         type: string
 *                       userId:
 *                         type: integer
 *                       userName:
 *                         type: string
 *                       action:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get("/", getLogs);

/**
 * @swagger
 * /logs/workspace/{workspaceId}:
 *   get:
 *     summary: Get logs for a specific workspace
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace ID
 *     responses:
 *       200:
 *         description: Workspace logs retrieved successfully
 *       403:
 *         description: Access denied to this workspace
 *       404:
 *         description: Workspace not found
 */
router.get("/workspace/:workspaceId", getWorkspaceLogs);

/**
 * @swagger
 * /logs:
 *   post:
 *     summary: Create a new log entry
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspaceId
 *               - action
 *             properties:
 *               workspaceId:
 *                 type: integer
 *                 description: Workspace ID where action occurred
 *               taskId:
 *                 type: integer
 *                 description: Task ID (optional, if action is task-related)
 *               action:
 *                 type: string
 *                 description: Action performed
 *                 example: "TASK_CREATED"
 *     responses:
 *       201:
 *         description: Log created successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/", createLog);

export default router;
