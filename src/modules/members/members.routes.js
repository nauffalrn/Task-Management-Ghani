import { Router } from "express";
import {
  getWorkspaceMembers,
  addMember,
  updateMember,
  removeMember,
} from "./members.controller.js";
import { verifyToken } from "../../common/middlewares/auth.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.get("/workspace/:workspaceId", getWorkspaceMembers);
router.post("/workspace/:workspaceId", addMember);
router.put("/workspace/:workspaceId/user/:userId", updateMember);
router.delete("/workspace/:workspaceId/user/:userId", removeMember);

export default router;
