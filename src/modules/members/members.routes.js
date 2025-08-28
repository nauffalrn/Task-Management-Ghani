import { Router } from "express";
import {
  getWorkspaceMembers,
  addMember,
  updateMember,
  removeMember,
} from "./members.controller.js";
import { verifyToken } from "../../common/middlewares/auth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Workspace member management endpoints
 */

// All routes require authentication
router.use(verifyToken);

/**
 * @swagger
 * /members/workspace/{workspaceId}:
 *   get:
 *     summary: Get workspace members
 *     description: Retrieve list of all members in a specific workspace with their roles
 *     tags: [Members]
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
 *     responses:
 *       200:
 *         description: Workspace members retrieved successfully
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
 *                   example: Workspace members retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     members:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Member'
 *                           - type: object
 *                             properties:
 *                               user:
 *                                 $ref: '#/components/schemas/User'
 *                               addedByUser:
 *                                 $ref: '#/components/schemas/User'
 *                     workspace:
 *                       $ref: '#/components/schemas/Workspace'
 *                     totalMembers:
 *                       type: integer
 *                       example: 5
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
 */
router.get("/workspace/:workspaceId", getWorkspaceMembers);

/**
 * @swagger
 * /members/workspace/{workspaceId}/add:
 *   post:
 *     summary: Add member to workspace
 *     description: Add a user as a member to a workspace. Department heads can only add users from their department.
 *     tags: [Members]
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
 *                 description: ID of the user to add as member
 *                 example: 6
 *                 minimum: 1
 *               role:
 *                 type: string
 *                 description: Role of the member in the workspace
 *                 enum: [admin, member]
 *                 example: member
 *     responses:
 *       201:
 *         description: Member added successfully
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
 *                   example: Member added to workspace successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     member:
 *                       $ref: '#/components/schemas/Member'
 *       400:
 *         description: Validation error or department restriction
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
 *                   example: You can only add users from your department
 *       404:
 *         description: Workspace or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User is already a member
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
 *                   example: User is already a member of this workspace
 *       403:
 *         description: Access denied - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/workspace/:workspaceId/add", addMember); // ✅ Ganti ke addMember

/**
 * @swagger
 * /members/workspace/{workspaceId}/user/{userId}:
 *   put:
 *     summary: Update member role
 *     description: Update the role of a member in a workspace (admin or member)
 *     tags: [Members]
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
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the user
 *         example: 6
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 description: New role for the member
 *                 enum: [admin, member]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Member role updated successfully
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
 *                   example: Member role updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     member:
 *                       $ref: '#/components/schemas/Member'
 *       400:
 *         description: Validation error or department restriction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Workspace or member not found
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
 *     summary: Remove member from workspace
 *     description: Remove a user from workspace membership
 *     tags: [Members]
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
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the user to remove
 *         example: 6
 *     responses:
 *       200:
 *         description: Member removed successfully
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
 *                   example: Member removed from workspace successfully
 *       404:
 *         description: Workspace or member not found
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
 *                   example: Member not found in this workspace
 *       403:
 *         description: Access denied - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/workspace/:workspaceId/user/:userId", updateMember);
router.delete("/workspace/:workspaceId/user/:userId", removeMember);

export default router;
