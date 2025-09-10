import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  changePassword,
} from "./auth.controller.js";
import { authenticate } from "../../common/middlewares/auth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: manager@gmi.com
 *         password:
 *           type: string
 *           example: aaaaaaaa
 *     LoginResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Login successful
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             accessToken:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             refreshToken:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             expiresIn:
 *               type: string
 *               example: 1d
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: User login
 *     description: Authenticate user and return JWT tokens
 *     security: []  # No auth required for login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register new user
 *     description: Register a new user account
 *     security: []  # No auth required for registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [owner, manager, head_it, head_marketing, head_finance, staff_it, staff_marketing, staff_finance]
 *                 example: staff_it
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User already exists
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get user profile
 *     description: Get current user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Profile retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticate, getProfile);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     description: Get new access token using refresh token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password
 *     description: Change user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password is incorrect
 *       401:
 *         description: Unauthorized
 */
router.post("/change-password", authenticate, changePassword);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: User logout
 *     description: Logout user (client-side token removal)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", authenticate, logout);

export default router;
