import { BaseController } from "../../common/controller/base.controller.js";
import { AuthService } from "./auth.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";

export class AuthController extends BaseController {
  constructor() {
    const authService = new AuthService();
    super(authService, "Auth");
  }

  async register(req, res, next) {
    try {
      const userData = req.body;
      const user = await this.service.register(userData);

      return ResponseHelper.created(res, user, "User registered successfully");
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ResponseHelper.badRequest(
          res,
          "Email and password are required"
        );
      }

      const result = await this.service.login(email, password);

      return ResponseHelper.success(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ResponseHelper.badRequest(res, "Refresh token is required");
      }

      const tokens = await this.service.refreshToken(refreshToken);

      return ResponseHelper.success(
        res,
        tokens,
        "Token refreshed successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // For now, just return success
      // In production, you might want to blacklist the token
      return ResponseHelper.success(res, null, "Logout successful");
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await this.service.findById(userId);

      if (!user) {
        return ResponseHelper.notFound(res, "User not found");
      }

      return ResponseHelper.success(
        res,
        user,
        "Profile retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const updateData = req.body;

      // Don't allow password update through this endpoint
      delete updateData.password;

      const user = await this.service.update(userId, updateData);

      return ResponseHelper.success(res, user, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return ResponseHelper.badRequest(
          res,
          "Current password and new password are required"
        );
      }

      if (newPassword.length < 6) {
        return ResponseHelper.badRequest(
          res,
          "New password must be at least 6 characters long"
        );
      }

      const result = await this.service.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      return ResponseHelper.success(
        res,
        result,
        "Password changed successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}

// Export individual functions for routes
const controller = new AuthController();

export const register = (req, res, next) => controller.register(req, res, next);

export const login = (req, res, next) => controller.login(req, res, next);

export const refreshToken = (req, res, next) =>
  controller.refreshToken(req, res, next);

export const logout = (req, res, next) => controller.logout(req, res, next);

export const getProfile = (req, res, next) =>
  controller.getProfile(req, res, next);

export const updateProfile = (req, res, next) =>
  controller.updateProfile(req, res, next);

export const changePassword = (req, res, next) =>
  controller.changePassword(req, res, next);
