import { BaseController } from "../../common/controller/base.controller.js";
import { UsersService } from "./users.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js"; // UBAH: Import ResponseHelper class

class UsersController extends BaseController {
  constructor() {
    super();
    this.usersService = new UsersService();
  }

  // GET /api/users - List all users
  getUsers = async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, role } = req.query;

      const users = await this.usersService.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        role,
      });

      return ResponseHelper.success(res, users, "Users retrieved successfully"); // UBAH: ResponseHelper.success
    } catch (error) {
      next(error);
    }
  };

  // GET /api/users/:id - Get user by ID
  getUserById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await this.usersService.getUserById(id);

      return ResponseHelper.success(res, user, "User retrieved successfully"); // UBAH: ResponseHelper.success
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/users/:id - Update user
  updateUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await this.usersService.updateUser(id, updateData);

      return ResponseHelper.success(res, user, "User updated successfully"); // UBAH: ResponseHelper.success
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/users/:id - Delete user
  deleteUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.usersService.deleteUser(id);

      return ResponseHelper.success(res, null, "User deleted successfully"); // UBAH: ResponseHelper.success
    } catch (error) {
      next(error);
    }
  };

  // GET /api/users/profile - Get current user profile
  getProfile = async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const user = await this.usersService.getUserById(userId);

      return ResponseHelper.success(
        res,
        user,
        "Profile retrieved successfully"
      ); // UBAH: ResponseHelper.success
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/users/profile - Update current user profile
  updateProfile = async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const updateData = req.body;

      const user = await this.usersService.updateUser(userId, updateData);

      return ResponseHelper.success(res, user, "Profile updated successfully"); // UBAH: ResponseHelper.success
    } catch (error) {
      next(error);
    }
  };

  // TAMBAH: Method createUser yang diperlukan routes
  createUser = async (req, res, next) => {
    try {
      const userData = req.body;

      // Create user logic - bisa menggunakan auth service atau buat method baru di users service
      const user = await this.usersService.createUser(userData);

      return ResponseHelper.created(res, user, "User created successfully");
    } catch (error) {
      next(error);
    }
  };
}

export const usersController = new UsersController();
export { UsersController };

// TAMBAH: Export individual methods untuk routes
export const getUsers = usersController.getUsers;
export const getUserById = usersController.getUserById;
export const createUser = usersController.createUser;
export const updateUser = usersController.updateUser;
export const deleteUser = usersController.deleteUser;
