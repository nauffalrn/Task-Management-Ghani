import { Router } from "express";
import {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
} from "./comments.controller.js";
import { verifyToken } from "../../common/middlewares/auth.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.get("/task/:taskId", getTaskComments);
router.post("/", createComment);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;
