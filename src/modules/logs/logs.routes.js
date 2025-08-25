import { Router } from "express";
import { getLogs, getWorkspaceLogs, createLog } from "./logs.controller.js";
import { verifyToken, requireRole } from "../../common/middlewares/auth.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.get("/", getLogs);
router.get("/workspace/:workspaceId", getWorkspaceLogs);
router.post(
  "/",
  requireRole([ROLES.MANAGER, ROLES.LEADER, ROLES.PROJECT_MANAGER]),
  createLog
);

export default router;
