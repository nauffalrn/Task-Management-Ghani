import { Router } from "express";
import { authenticate, authorize } from "../../common/middlewares/auth.js";
import {
  getLogs,
  getLogById,
  getLogsByWorkspace,
  getLogsByUser,
} from "./logs.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Activity log management endpoints
 */

/**
 * @swagger
 * /api/logs:
 *   get:
 *     tags: [Logs]
 *     summary: Get all logs
 *     description: Retrieve a list of all activity logs (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of logs per page
 *       - in: query
 *         name: workspaceId
 *         schema:
 *           type: integer
 *         description: Filter by workspace ID
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
 *                     $ref: '#/components/schemas/Log'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get("/", authenticate, authorize(["owner", "manager"]), getLogs);

/**
 * @swagger
 * /api/logs/workspace/{workspaceId}:
 *   get:
 *     tags: [Logs]
 *     summary: Get logs by workspace
 *     description: Get all activity logs for a specific workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of logs per page
 *     responses:
 *       200:
 *         description: Workspace logs retrieved successfully
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
 *                   example: Workspace logs retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Log'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/workspace/:workspaceId", authenticate, getLogsByWorkspace);

/**
 * @swagger
 * /api/logs/my:
 *   get:
 *     tags: [Logs]
 *     summary: Get my activity logs
 *     description: Get activity logs for current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of logs per page
 *     responses:
 *       200:
 *         description: User logs retrieved successfully
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
 *                   example: User logs retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Log'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/my", authenticate, getLogsByUser);

/**
 * @swagger
 * /api/logs/{id}:
 *   get:
 *     tags: [Logs]
 *     summary: Get log by ID
 *     description: Retrieve a specific log by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Log ID
 *     responses:
 *       200:
 *         description: Log retrieved successfully
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
 *                   example: Log retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Log'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:id", authenticate, getLogById);

export default router;
