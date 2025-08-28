import { Router } from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "./tasks.controller.js";
import { verifyToken } from "../../common/middlewares/auth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints within workspaces
 */

// All routes require authentication
router.use(verifyToken);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Retrieve all tasks across workspaces (admin view for owners/managers)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, done]
 *         description: Filter tasks by status
 *         example: in_progress
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *         description: Filter tasks by assigned user ID
 *         example: 6
 *       - in: query
 *         name: workspaceId
 *         schema:
 *           type: integer
 *         description: Filter tasks by workspace ID
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of tasks to return
 *         example: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of tasks to skip
 *         example: 0
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
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
 *                   example: Tasks retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Task'
 *                           - type: object
 *                             properties:
 *                               workspace:
 *                                 $ref: '#/components/schemas/Workspace'
 *                               assignedUser:
 *                                 $ref: '#/components/schemas/User'
 *                               creator:
 *                                 $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 50
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         offset:
 *                           type: integer
 *                           example: 0
 *                         hasMore:
 *                           type: boolean
 *                           example: true
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new task
 *     description: Create a new task within a workspace
 *     tags: [Tasks]
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
 *               - title
 *               - description
 *             properties:
 *               workspaceId:
 *                 type: integer
 *                 description: ID of the workspace where task will be created
 *                 example: 1
 *                 minimum: 1
 *               title:
 *                 type: string
 *                 description: Brief title for the task
 *                 example: Fix login authentication bug
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 description: Detailed description of the task
 *                 example: Fix the JWT authentication issue that prevents users from logging in after token expiration
 *                 minLength: 10
 *                 maxLength: 1000
 *               assignedTo:
 *                 type: integer
 *                 description: ID of the user to assign this task to
 *                 example: 6
 *                 minimum: 1
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Due date for task completion
 *                 example: 2024-12-31T23:59:59.000Z
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: Priority level of the task
 *                 example: high
 *                 default: medium
 *     responses:
 *       201:
 *         description: Task created successfully
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
 *                   example: Task created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Workspace not found or user not found
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
router.get("/", getTasks);
router.post("/", createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     description: Retrieve detailed information about a specific task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the task
 *         example: 1
 *     responses:
 *       200:
 *         description: Task retrieved successfully
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
 *                   example: Task retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Task'
 *                         - type: object
 *                           properties:
 *                             workspace:
 *                               $ref: '#/components/schemas/Workspace'
 *                             assignedUser:
 *                               $ref: '#/components/schemas/User'
 *                             creator:
 *                               $ref: '#/components/schemas/User'
 *                             comments:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/Comment'
 *                             attachments:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/Attachment'
 *       404:
 *         description: Task not found
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
 *   put:
 *     summary: Update task
 *     description: Update task information (title, description, due date, etc.)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the task to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: New task title
 *                 example: Fix login and registration authentication bugs
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 description: New task description
 *                 example: Updated description with more details about the authentication issues
 *                 minLength: 10
 *                 maxLength: 1000
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: New due date
 *                 example: 2024-12-31T23:59:59.000Z
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: New priority level
 *                 example: urgent
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *                 description: New task status
 *                 example: in_progress
 *               assignedTo:
 *                 type: integer
 *                 description: ID of user to assign task to
 *                 example: 7
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Task updated successfully
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
 *         description: Task not found
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
 *     summary: Delete task
 *     description: Permanently delete a task and all its associated data
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the task to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Task deleted successfully
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
 *                   example: Task deleted successfully
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied - only task creator or workspace admin can delete
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
