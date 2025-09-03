import { Router } from "express";
import { authenticateToken } from "../../common/middlewares/auth.js";
import {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceStats, // Tambahkan ini
} from "./workspaces.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: Workspace management endpoints (project containers)
 */

/**
 * @swagger
 * /workspaces:
 *   get:
 *     summary: Get all workspaces accessible to user
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for workspace name or description
 *     responses:
 *       200:
 *         description: Workspaces retrieved successfully
 */
router.get("/", getWorkspaces);

/**
 * @swagger
 * /workspaces/{id}/stats:
 *   get:
 *     summary: Get workspace statistics
 *     description: Get detailed statistics for a specific workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace ID
 *     responses:
 *       200:
 *         description: Workspace statistics retrieved successfully
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
 *                   example: Workspace statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalMembers:
 *                       type: integer
 *                       example: 15
 *                     adminCount:
 *                       type: integer
 *                       example: 3
 *                     memberCount:
 *                       type: integer
 *                       example: 12
 *       403:
 *         description: Access denied to this workspace
 *       404:
 *         description: Workspace not found
 */
router.get("/:id/stats", getWorkspaceStats);

/**
 * @swagger
 * /workspaces/{id}:
 *   get:
 *     summary: Get workspace by ID
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace ID
 *     responses:
 *       200:
 *         description: Workspace retrieved successfully
 *       403:
 *         description: Access denied to this workspace
 *       404:
 *         description: Workspace not found
 */
router.get("/:id", getWorkspaceById);

/**
 * @swagger
 * /workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Workspace name
 *               description:
 *                 type: string
 *                 description: Workspace description
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Access denied - insufficient permissions
 */
router.post("/", createWorkspace);

/**
 * @swagger
 * /workspaces/{id}:
 *   put:
 *     summary: Update a workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Workspace name
 *               description:
 *                 type: string
 *                 description: Workspace description
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Access denied - insufficient permissions
 *       404:
 *         description: Workspace not found
 */
router.put("/:id", updateWorkspace);

/**
 * @swagger
 * /workspaces/{id}:
 *   delete:
 *     summary: Delete a workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace ID
 *     responses:
 *       200:
 *         description: Workspace deleted successfully
 *       403:
 *         description: Access denied - insufficient permissions
 *       404:
 *         description: Workspace not found
 */
router.delete("/:id", deleteWorkspace);

export default router;
