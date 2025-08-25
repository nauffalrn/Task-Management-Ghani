import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./users.controller.js";
import { verifyToken, requireRole } from "../../common/middlewares/auth.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Get all users (all authenticated users can see user list)
router.get("/", getUsers);

// Get user by ID
router.get("/:id", getUserById);

// Admin only routes
router.post("/", requireRole([ROLES.MANAGER]), createUser);
router.put("/:id", requireRole([ROLES.MANAGER]), updateUser);
router.delete("/:id", requireRole([ROLES.MANAGER]), deleteUser);

export default router;
