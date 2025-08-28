import { Router } from "express";
import {
  getTaskAttachments,
  getAttachmentById,
  createAttachment,
  deleteAttachment,
} from "./attachments.controller.js";
import { verifyToken } from "../../common/middlewares/auth.js";
import { uploadSingle } from "../../common/middlewares/upload.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Get attachments for a specific task
router.get("/task/:taskId", getTaskAttachments);

// Get single attachment by ID
router.get("/:id", getAttachmentById);

// Upload attachment to task - UPDATE: add multer middleware
router.post("/task/:taskId/upload", uploadSingle, createAttachment);

// Delete attachment
router.delete("/:id", deleteAttachment);

export default router;
