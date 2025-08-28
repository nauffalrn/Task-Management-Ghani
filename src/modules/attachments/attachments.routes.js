import { Router } from "express";
import {
  getTaskAttachments,
  getAttachmentById,
  createAttachment,
  deleteAttachment,
} from "./attachments.controller.js";
import { verifyToken } from "../../common/middlewares/auth.js";
import { upload } from "../../common/middlewares/upload.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Attachments
 *   description: Task file attachment management endpoints
 */

// All routes require authentication
router.use(verifyToken);

/**
 * @swagger
 * /attachments/task/{taskId}:
 *   get:
 *     summary: Get task attachments
 *     description: Retrieve all file attachments for a specific task
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the task
 *         example: 1
 *     responses:
 *       200:
 *         description: Task attachments retrieved successfully
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
 *                   example: Task attachments retrieved successfully
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Upload attachment
 *     description: Upload a file attachment to a task (max 10MB per file)
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the task
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (max 10MB)
 *               description:
 *                 type: string
 *                 description: Optional description for the attachment
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
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
 *                   example: Attachment uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     attachment:
 *                       $ref: '#/components/schemas/Attachment'
 *       400:
 *         description: Validation error or file too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/task/:taskId", getTaskAttachments);
router.post("/task/:taskId", upload.single("file"), createAttachment);

/**
 * @swagger
 * /attachments/{id}:
 *   get:
 *     summary: Get attachment info by ID
 *     description: Retrieve detailed information about a specific attachment
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the attachment
 *         example: 1
 *     responses:
 *       200:
 *         description: Attachment info retrieved successfully
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
 *                   example: Attachment retrieved successfully
 *       404:
 *         description: Attachment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete attachment
 *     description: Permanently delete a file attachment (only by uploader or workspace admin)
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the attachment to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
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
 *                   example: Attachment deleted successfully
 *       404:
 *         description: Attachment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getAttachmentById);
router.delete("/:id", deleteAttachment);

/**
 * @swagger
 * /attachments/{id}/download:
 *   get:
 *     summary: Download attachment file
 *     description: Download the actual file content of an attachment
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the attachment
 *         example: 1
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Attachment or file not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export default router;
