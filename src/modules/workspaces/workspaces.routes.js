import { Router } from "express";
import {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "./workspaces.controller.js";
import { verifyToken } from "../../common/middlewares/auth.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.get("/", getWorkspaces);
router.get("/:id", getWorkspaceById);
router.post("/", createWorkspace);
router.put("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);

export default router;
