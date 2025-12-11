import { Router } from "express";
import { authenticate, authorize } from "../../common/middlewares/auth.js";
import { upload } from "../../common/middlewares/upload.js";
import {
  getAttachments,
  getAttachmentById,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
  getAttachmentsByTask,
} from "./attachments.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Attachments
 *   description: File attachment management endpoints
 */

/**
 * @swagger
 * /api/attachments:
 *   get:
 *     tags: [Attachments]
 *     summary: Get all attachments
 *     description: Retrieve a list of all attachments
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
 *         description: Number of attachments per page
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: integer
 *         description: Filter by task ID
 *     responses:
 *       200:
 *         description: Attachments retrieved successfully
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
 *                   example: Attachments retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attachment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/", authenticate, getAttachments);

/**
 * @swagger
 * /api/attachments/task/{taskId}:
 *   get:
 *     tags: [Attachments]
 *     summary: Get attachments by task
 *     description: Get all attachments for a specific task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task attachments retrieved successfully
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
 *                   example: Task attachments retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attachment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/task/:taskId", authenticate, getAttachmentsByTask);

/**
 * @swagger
 * /api/attachments/{id}:
 *   get:
 *     tags: [Attachments]
 *     summary: Get attachment by ID
 *     description: Retrieve a specific attachment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: Attachment retrieved successfully
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
 *                   example: Attachment retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Attachment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:id", authenticate, getAttachmentById);

/**
 * @swagger
 * /api/attachments/download/{id}:
 *   get:
 *     tags: [Attachments]
 *     summary: Download attachment
 *     description: Download an attachment file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/download/:id", authenticate, downloadAttachment);

/**
 * @swagger
 * /api/attachments:
 *   post:
 *     tags: [Attachments]
 *     summary: Upload attachment
 *     description: Upload a file attachment to a task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - file
 *             properties:
 *               taskId:
 *                 type: integer
 *                 example: 1
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
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
 *                   example: Attachment uploaded successfully
 *                 data:
 *                   $ref: '#/components/schemas/Attachment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post("/", authenticate, upload.single("file"), uploadAttachment);

/**
 * @swagger
 * /api/attachments/{id}:
 *   delete:
 *     tags: [Attachments]
 *     summary: Delete attachment
 *     description: Delete an attachment file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/:id", authenticate, deleteAttachment);

export default router;
