import { Router } from "express";
import {
  getTaskAttachments,
  getAttachmentById,
  createAttachment,
  deleteAttachment,
} from "./attachments.controller.js";
import { verifyToken } from "../../common/middlewares/auth.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.get("/task/:taskId", getTaskAttachments);
router.get("/:id", getAttachmentById);
router.post("/", createAttachment);
router.delete("/:id", deleteAttachment);

export default router;
