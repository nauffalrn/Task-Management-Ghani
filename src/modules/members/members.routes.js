import { Router } from "express";
import { authenticateToken } from "../../common/middlewares/auth.js";
import {
  getWorkspaceMembers,
  addMember,
  updateMember,
  removeMember,
} from "./members.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Workspace member management endpoints
 */

/**
 * @swagger
 * /members/workspace/{workspaceId}:
 *   get:
 *     summary: Get members of a workspace
 *     tags: [Members]
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
 *         description: Workspace members retrieved successfully
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
 *                   example: Workspace members retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       userName:
 *                         type: string
 *                       userEmail:
 *                         type: string
 *                       userRole:
 *                         type: string
 *                       workspaceRole:
 *                         type: string
 *                         enum: [admin, member]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       403:
 *         description: Access denied to this workspace
 *       404:
 *         description: Workspace not found
 */
router.get("/workspace/:workspaceId", getWorkspaceMembers);

/**
 * @swagger
 * /members/workspace/{workspaceId}:
 *   post:
 *     summary: Add a member to workspace
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
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
 *             required:
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of user to add as member
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *                 description: Role in the workspace
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Access denied - insufficient permissions
 *       404:
 *         description: Workspace or user not found
 *       409:
 *         description: User is already a member of this workspace
 */
router.post("/workspace/:workspaceId", addMember);

/**
 * @swagger
 * /members/workspace/{workspaceId}/user/{userId}:
 *   put:
 *     summary: Update member role in workspace
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *                 description: New role for the member
 *     responses:
 *       200:
 *         description: Member updated successfully
 *       400:
 *         description: Invalid role
 *       403:
 *         description: Access denied - insufficient permissions
 *       404:
 *         description: Workspace or member not found
 */
router.put("/workspace/:workspaceId/user/:userId", updateMember);

/**
 * @swagger
 * /members/workspace/{workspaceId}/user/{userId}:
 *   delete:
 *     summary: Remove member from workspace
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       403:
 *         description: Access denied - insufficient permissions
 *       404:
 *         description: Workspace or member not found
 */
router.delete("/workspace/:workspaceId/user/:userId", removeMember);

export default router;
