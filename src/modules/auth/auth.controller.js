import { BaseController } from "../../common/controller/base.controller.js";
import { AuthService } from "./auth.service.js";

class AuthController extends BaseController {
  constructor() {
    super();
    this.authService = new AuthService();
  }

  register = async (req, res) => {
    try {
      const userData = req.body;

      const result = await this.authService.register(userData);

      return this.sendSuccessResponse(
        res,
        "User registered successfully",
        result,
        null,
        201
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      return this.sendSuccessResponse(res, "Login successful", result);
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  logout = async (req, res) => {
    try {
      // For JWT, logout is handled on client side by removing token
      // Here we can add token blacklisting logic if needed

      return this.sendSuccessResponse(res, "Logout successful");
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  getProfile = async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await this.authService.getProfile(userId);

      return this.sendSuccessResponse(
        res,
        "Profile retrieved successfully",
        user
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };
}

const authController = new AuthController();

export const { register, login, logout, getProfile } = authController;
