import { BaseController } from "../../common/controller/base.controller.js";
import { UsersService } from "./users.service.js";

class UsersController extends BaseController {
  constructor() {
    super();
    this.usersService = new UsersService();
  }

  getUsers = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const users = await this.usersService.getUsers({ page, limit });

      return res.status(200).json({
        status: "success",
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message,
      });
    }
  };

  getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await this.usersService.getUserById(id);

      return res.status(200).json({
        status: "success",
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message,
      });
    }
  };

  createUser = async (req, res) => {
    try {
      const userData = req.body;
      const newUser = await this.usersService.createUser(userData);

      return res.status(201).json({
        status: "success",
        message: "User created successfully",
        data: newUser,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message,
      });
    }
  };

  updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      const updatedUser = await this.usersService.updateUser(id, userData);

      return res.status(200).json({
        status: "success",
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message,
      });
    }
  };

  deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      await this.usersService.deleteUser(id);

      return res.status(200).json({
        status: "success",
        message: "User deleted successfully",
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message,
      });
    }
  };
}

const usersController = new UsersController();

export const { getUsers, getUserById, createUser, updateUser, deleteUser } =
  usersController;
