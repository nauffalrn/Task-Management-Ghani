import { Router } from "express";
import { authenticate, authorize } from "../../common/middlewares/auth.js";
import {
  getWorkspaces, // UBAH: dari getAllWorkspaces ke getWorkspaces
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getMyWorkspaces,
} from "./workspaces.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: Workspace management endpoints
 */

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     tags: [Workspaces]
 *     summary: Get all workspaces
 *     description: Retrieve a list of all workspaces
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
 *         description: Number of workspaces per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for workspace name or description
 *     responses:
 *       200:
 *         description: Workspaces retrieved successfully
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
 *                   example: Workspaces retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Workspace'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  "/",
  authenticate,
  authorize(["owner", "manager", "head_it", "head_marketing", "head_finance"]),
  getWorkspaces
);

/**
 * @swagger
 * /api/workspaces/{id}:
 *   get:
 *     tags: [Workspaces]
 *     summary: Get workspace by ID
 *     description: Retrieve a specific workspace by ID
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
 *                   example: Workspace retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Workspace'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:id", authenticate, getWorkspaceById);

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     tags: [Workspaces]
 *     summary: Create new workspace
 *     description: Create a new workspace (manager and above only)
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
 *                 example: IT Department
 *               description:
 *                 type: string
 *                 example: Workspace for IT department tasks
 *     responses:
 *       201:
 *         description: Workspace created successfully
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
 *                   example: Workspace created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Workspace'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  "/",
  authenticate,
  authorize(["owner", "manager", "head_it", "head_marketing", "head_finance"]),
  createWorkspace
);

/**
 * @swagger
 * /api/workspaces/{id}:
 *   put:
 *     tags: [Workspaces]
 *     summary: Update workspace
 *     description: Update an existing workspace (owner only)
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
 *                 example: IT Department Updated
 *               description:
 *                 type: string
 *                 example: Updated workspace description
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put("/:id", authenticate, updateWorkspace);

/**
 * @swagger
 * /api/workspaces/{id}:
 *   delete:
 *     tags: [Workspaces]
 *     summary: Delete workspace
 *     description: Delete a workspace (owner only)
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/:id", authenticate, deleteWorkspace);

/**
 * @swagger
 * /api/workspaces/my:
 *   get:
 *     tags: [Workspaces]
 *     summary: Get my workspaces
 *     description: Get workspaces owned by current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User workspaces retrieved successfully
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
 *                   example: User workspaces retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Workspace'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/my", authenticate, getMyWorkspaces);

export default router;
