import { Router } from "express";
import { upload, handleMulterError } from "../../common/middlewares/upload.js";
import { authenticateToken } from "../../common/middlewares/auth.js";
import {
  getTaskAttachments,
  getAttachmentById,
  createAttachment,
  deleteAttachment,
  downloadAttachment,
} from "./attachments.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Attachments
 *   description: Task file attachment management endpoints
 */

/**
 * @swagger
 * /attachments/task/{taskId}:
 *   get:
 *     summary: Get all attachments for a task
 *     tags: [Attachments]
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
 */
router.get("/task/:taskId", getTaskAttachments);

/**
 * @swagger
 * /attachments/task/{taskId}:
 *   post:
 *     summary: Upload file attachment to a task
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or missing data
 */
router.post(
  "/task/:taskId",
  upload.single("file"),
  handleMulterError,
  createAttachment
);

/**
 * @swagger
 * /attachments/{id}:
 *   get:
 *     summary: Get attachment details by ID
 *     tags: [Attachments]
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
 *         description: Attachment details retrieved successfully
 *       404:
 *         description: Attachment not found
 */
router.get("/:id", getAttachmentById);

/**
 * @swagger
 * /attachments/{id}/download:
 *   get:
 *     summary: Download attachment file
 *     tags: [Attachments]
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
 *         description: File download initiated
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Attachment or file not found
 */
router.get("/:id/download", downloadAttachment);

/**
 * @swagger
 * /attachments/{id}:
 *   delete:
 *     summary: Delete an attachment
 *     tags: [Attachments]
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
 *       403:
 *         description: Access denied - not the owner
 *       404:
 *         description: Attachment not found
 */
router.delete("/:id", deleteAttachment);

export default router;
