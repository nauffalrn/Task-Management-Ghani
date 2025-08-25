import { Router } from "express";
import {
  getTasks,
  getTaskById,
  getMyTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./tasks.controller.js";
import { verifyToken } from "../../common/middlewares/auth.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.get("/", getTasks);
router.get("/my-tasks", getMyTasks);
router.get("/:id", getTaskById);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
