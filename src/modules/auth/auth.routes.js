import { Router } from "express";
import { login, verifyToken, logout, getProfile } from "./auth.controller.js";
import { verifyToken as authMiddleware } from "../../common/middlewares/auth.js";

const router = Router();

// Public routes
router.post("/login", login);
router.post("/verify", verifyToken);

// Protected routes
router.use(authMiddleware);
router.post("/logout", logout);
router.get("/profile", getProfile);

export default router;
