import { Router } from "express";
import {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "./workspaces.controller.js";
import { verifyToken } from "../../common/middlewares/auth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: Workspace management endpoints (project containers)
 */

// All routes require authentication
router.use(verifyToken);

/**
 * @swagger
 * /workspaces:
 *   get:
 *     summary: Get all workspaces
 *     description: Retrieve list of workspaces based on user role. Members see only workspaces they belong to.
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workspaces retrieved successfully
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
 *                   example: Workspaces retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     workspaces:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Workspace'
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     userRole:
 *                       type: string
 *                       example: head_it
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new workspace
 *     description: Create a new workspace (project). Only managers and department heads can create workspaces.
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique name for the workspace
 *                 example: Mobile App Development
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 description: Detailed description of the workspace purpose
 *                 example: Development workspace for mobile application project
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Workspace created successfully
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
 *                   example: Workspace created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     workspace:
 *                       $ref: '#/components/schemas/Workspace'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied - only managers and department heads can create workspaces
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
 *                   example: Access denied. Only managers and department heads can create workspaces.
 *       409:
 *         description: Workspace name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getWorkspaces);
router.post("/", createWorkspace);

/**
 * @swagger
 * /workspaces/{id}:
 *   get:
 *     summary: Get workspace by ID
 *     description: Retrieve detailed information about a specific workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the workspace
 *         example: 1
 *     responses:
 *       200:
 *         description: Workspace retrieved successfully
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
 *                   example: Workspace retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     workspace:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Workspace'
 *                         - type: object
 *                           properties:
 *                             memberCount:
 *                               type: integer
 *                               example: 5
 *                             taskCount:
 *                               type: integer
 *                               example: 12
 *       404:
 *         description: Workspace not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied - not a member of this workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update workspace
 *     description: Update workspace information (name and/or description)
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the workspace to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New workspace name
 *                 example: Updated Mobile App Development
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 description: New workspace description
 *                 example: Updated description for mobile application project
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Workspace not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete workspace
 *     description: Permanently delete a workspace and all its associated data
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the workspace to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Workspace deleted successfully
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
 *                   example: Workspace deleted successfully
 *       404:
 *         description: Workspace not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied - only managers and workspace creators can delete
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getWorkspaceById);
router.put("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);

export default router;
