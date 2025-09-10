import { BaseController } from "../../common/controller/base.controller.js";
import { AuthService } from "./auth.service.js";

const authService = new AuthService();

export const register = async (req, res) => {
  try {
    const userData = req.body;
    const result = await authService.register(userData);

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res.status(200).json({
      status: "success",
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    // PERBAIKAN: Gunakan userId dari token, bukan id
    const userId = req.user.userId; // UBAH DARI req.user.id KE req.user.userId
    console.log("🎯 Controller getProfile - userId from token:", userId);

    const user = await authService.getProfile(userId);

    return res.status(200).json({
      status: "success",
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("❌ Controller getProfile error:", error);
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: "error",
        message: "Refresh token is required",
      });
    }

    const result = await authService.refreshToken(refreshToken);

    return res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 401).json({
      status: "error",
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Current password and new password are required",
      });
    }

    const result = await authService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      status: "success",
      message: "Password changed successfully",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message,
    });
  }
};
