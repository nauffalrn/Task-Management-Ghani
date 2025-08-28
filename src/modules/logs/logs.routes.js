import { Router } from "express";
import {
  getLogs,
  getWorkspaceLogs,
  createLog, // ✅ Yang tersedia di controller
} from "./logs.controller.js";
import { verifyToken } from "../../common/middlewares/auth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Activity logging and audit trail endpoints
 */

// All routes require authentication
router.use(verifyToken);

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get all logs
 *     description: Retrieve system-wide activity logs (admin access only)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by specific action type
 *         example: task_created
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter by user ID
 *         example: 6
 *       - in: query
 *         name: workspaceId
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter by workspace ID
 *         example: 1
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter by task ID
 *         example: 1
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date
 *         example: 2024-08-01T00:00:00.000Z
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs until this date
 *         example: 2024-08-31T23:59:59.999Z
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of logs to return
 *         example: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of logs to skip
 *         example: 0
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order by creation date
 *         example: desc
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logs retrieved successfully
 *       403:
 *         description: Access denied - admin access required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Access denied. Only owners and managers can view all logs.
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a log entry
 *     description: Create a new log entry for system activity tracking
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
 *               - action
 *               - message
 *             properties:
 *               action:
 *                 type: string
 *                 description: Type of action performed
 *                 example: task_created
 *               message:
 *                 type: string
 *                 description: Log message
 *                 example: Task "Fix login bug" was created
 *               workspaceId:
 *                 type: integer
 *                 description: Related workspace ID
 *                 example: 1
 *               taskId:
 *                 type: integer
 *                 description: Related task ID
 *                 example: 1
 *     responses:
 *       201:
 *         description: Log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Log created successfully
 */
router.get("/", getLogs);
router.post("/", createLog);

/**
 * @swagger
 * /logs/workspace/{workspaceId}:
 *   get:
 *     summary: Get workspace logs
 *     description: Retrieve activity logs for a specific workspace
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the workspace
 *         example: 1
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by specific action type
 *         example: task_created
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter by user ID
 *         example: 6
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date
 *         example: 2024-08-01T00:00:00.000Z
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs until this date
 *         example: 2024-08-31T23:59:59.999Z
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of logs to return
 *         example: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of logs to skip
 *         example: 0
 *     responses:
 *       200:
 *         description: Workspace logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Workspace logs retrieved successfully
 *       404:
 *         description: Workspace not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied - not a member of workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/workspace/:workspaceId", getWorkspaceLogs);

export default router;
