import { AuthService } from "./auth.service.js";
import { asyncHandler } from "../../common/middlewares/error.js";

const authService = new AuthService();

export const login = asyncHandler(async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({
      success: false,
      message: "Name and password are required",
      error_code: "MISSING_CREDENTIALS",
    });
  }

  const result = await authService.login(name, password);

  res.status(200).json(result);
});

export const verifyToken = asyncHandler(async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
      error_code: "NO_TOKEN",
    });
  }

  const result = await authService.verifyToken(token);

  res.status(200).json(result);
});

export const logout = asyncHandler(async (req, res) => {
  // For JWT, logout is handled on client-side by removing token
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;

  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: { user: userWithoutPassword },
  });
});
