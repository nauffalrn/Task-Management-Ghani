import { Router } from "express";
import { authenticate, authorize } from "../../common/middlewares/auth.js";
import {
  getMembers,
  getMemberById,
  addMember,
  updateMember,
  removeMember,
  getMembersByWorkspace,
} from "./members.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Workspace member management endpoints
 */

/**
 * @swagger
 * /api/members:
 *   get:
 *     tags: [Members]
 *     summary: Get all members
 *     description: Retrieve a list of all workspace members
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
 *         description: Number of members per page
 *       - in: query
 *         name: workspaceId
 *         schema:
 *           type: integer
 *         description: Filter by workspace ID
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [owner, manager, head_it, head_marketing, head_finance, staff_it, staff_marketing, staff_finance]
 *         description: Filter by member role
 *     responses:
 *       200:
 *         description: Members retrieved successfully
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
 *                   example: Members retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       workspace_id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 2
 *                       role:
 *                         type: string
 *                         example: member
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       user_name:
 *                         type: string
 *                         example: John Doe
 *                       user_email:
 *                         type: string
 *                         example: john@example.com
 *                       user_role:
 *                         type: string
 *                         example: staff_it
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/", authenticate, getMembers);

/**
 * @swagger
 * /api/members/workspace/{workspaceId}:
 *   get:
 *     tags: [Members]
 *     summary: Get all members of a workspace
 *     description: Retrieve all members of a specific workspace
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
 *         description: Number of members per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [owner, manager, head_it, head_marketing, head_finance, staff_it, staff_marketing, staff_finance]
 *         description: Filter by member role
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
 *                         example: 1
 *                       workspace_id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 2
 *                       role:
 *                         type: string
 *                         example: member
 *                       user_name:
 *                         type: string
 *                         example: John Doe
 *                       user_email:
 *                         type: string
 *                         example: john@example.com
 *                       user_role:
 *                         type: string
 *                         example: staff_it
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/workspace/:workspaceId", authenticate, getMembersByWorkspace);

/**
 * @swagger
 * /api/members/{id}:
 *   get:
 *     tags: [Members]
 *     summary: Get member by ID
 *     description: Retrieve a specific member by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member retrieved successfully
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
 *                   example: Member retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     workspace_id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 2
 *                     role:
 *                       type: string
 *                       example: member
 *                     user_name:
 *                       type: string
 *                       example: John Doe
 *                     user_email:
 *                       type: string
 *                       example: john@example.com
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:id", authenticate, getMemberById);

/**
 * @swagger
 * /api/members:
 *   post:
 *     tags: [Members]
 *     summary: Add member to workspace
 *     description: Add a new member to a workspace
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
 *               - userId
 *             properties:
 *               workspaceId:
 *                 type: integer
 *                 example: 1
 *               userId:
 *                 type: integer
 *                 example: 2
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *                 default: member
 *                 example: member
 *                 description: Role dalam workspace (admin/member), berbeda dengan user role
 *     responses:
 *       201:
 *         description: Member added successfully
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
 *                   example: Member added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     workspace_id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 2
 *                     role:
 *                       type: string
 *                       example: member
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: User is already a member
 */
router.post(
  "/",
  authenticate,
  authorize(["owner", "manager", "head_it", "head_marketing", "head_finance"]),
  addMember
);

/**
 * @swagger
 * /api/members/{id}:
 *   put:
 *     tags: [Members]
 *     summary: Update member role
 *     description: Update a member's role in the workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Member ID
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
 *                 example: admin
 *                 description: Role dalam workspace (admin/member)
 *     responses:
 *       200:
 *         description: Member updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put("/:id", authenticate, authorize(["owner", "manager"]), updateMember);

/**
 * @swagger
 * /api/members/{id}:
 *   delete:
 *     tags: [Members]
 *     summary: Remove member from workspace
 *     description: Remove a member from the workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["owner", "manager"]),
  removeMember
);

export default router;
