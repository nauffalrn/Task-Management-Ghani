import { BaseController } from "../../common/controller/base.controller.js";
import { UsersService } from "./users.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";

export class UsersController extends BaseController {
  constructor() {
    const usersService = new UsersService();
    super(usersService, "User");
  }

  async search(req, res, next) {
    try {
      const { q: query, page, limit } = req.query;

      if (!query) {
        return ResponseHelper.badRequest(res, "Search query is required");
      }

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      };

      const users = await this.service.search(query, options);

      return ResponseHelper.success(
        res,
        users,
        "Users search completed successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Override create to handle password hashing
  async create(req, res, next) {
    try {
      const userData = req.body;
      const user = await this.service.create(userData);

      return ResponseHelper.created(res, user, "User created successfully");
    } catch (error) {
      next(error);
    }
  }

  // Override update to handle password hashing
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const userData = req.body;

      const user = await this.service.update(parseInt(id), userData);

      return ResponseHelper.success(res, user, "User updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

// Export individual functions for routes
const controller = new UsersController();

export const getUsers = (req, res, next) => controller.getAll(req, res, next);

export const getUserById = (req, res, next) =>
  controller.getById(req, res, next);

export const createUser = (req, res, next) => controller.create(req, res, next);

export const updateUser = (req, res, next) => controller.update(req, res, next);

export const deleteUser = (req, res, next) => controller.delete(req, res, next);

export const searchUsers = (req, res, next) =>
  controller.search(req, res, next);
