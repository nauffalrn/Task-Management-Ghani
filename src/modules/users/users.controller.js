import { BaseController } from "../../common/controller/base.controller.js";
import { UsersService } from "./users.service.js";

class UsersController extends BaseController {
  constructor() {
    super();
    this.usersService = new UsersService();
  }

  getAllUsers = async (req, res) => {
    try {
      const { page = 1, limit = 10, role, search } = req.query;

      const result = await this.usersService.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        search,
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Users retrieved successfully",
        result.data,
        result.meta
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  getUserById = async (req, res) => {
    try {
      const { id } = req.params;

      const user = await this.usersService.getUserById(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(res, "User retrieved successfully", user);
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  createUser = async (req, res) => {
    try {
      const userData = req.body;

      const user = await this.usersService.createUser(userData, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "User created successfully",
        user,
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

  updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await this.usersService.updateUser(id, updateData, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(res, "User updated successfully", user);
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  deleteUser = async (req, res) => {
    try {
      const { id } = req.params;

      await this.usersService.deleteUser(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(res, "User deleted successfully");
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  getUserStats = async (req, res) => {
    try {
      const { id } = req.params;

      const stats = await this.usersService.getUserStats(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "User statistics retrieved successfully",
        stats
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

const usersController = new UsersController();

export const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} = usersController;
