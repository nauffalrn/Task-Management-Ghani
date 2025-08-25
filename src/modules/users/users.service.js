import bcrypt from "bcryptjs";
import { db } from "../../config/db.js";
import { users } from "../../../drizzle/schema.js";
import { UsersRepository } from "./users.repo.js";
import { ROLES } from "../../common/constants/roles.js";

export class UsersService {
  constructor() {
    this.usersRepo = new UsersRepository();
  }

  async getAllUsers(search = "") {
    try {
      const usersList = await this.usersRepo.findAll(search);

      // Remove passwords from response
      const usersWithoutPasswords = usersList.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return {
        success: true,
        message: "Users retrieved successfully",
        data: { users: usersWithoutPasswords },
      };
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  async getUserById(id) {
    try {
      const user = await this.usersRepo.findById(id);

      if (!user) {
        throw new Error("User not found");
      }

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        message: "User retrieved successfully",
        data: { user: userWithoutPassword },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createUser(userData) {
    try {
      const { name, password, role } = userData;

      // Validate required fields
      if (!name || !password || !role) {
        throw new Error("Name, password, and role are required");
      }

      // Validate role
      if (!Object.values(ROLES).includes(role)) {
        throw new Error("Invalid role");
      }

      // Check if user already exists
      const existingUser = await this.usersRepo.findByName(name);
      if (existingUser) {
        throw new Error("User with this name already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await this.usersRepo.create({
        name,
        password: hashedPassword,
        role,
      });

      const { password: _, ...userWithoutPassword } = newUser;

      return {
        success: true,
        message: "User created successfully",
        data: { user: userWithoutPassword },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateUser(id, userData) {
    try {
      const existingUser = await this.usersRepo.findById(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      const updateData = { ...userData };

      // Hash password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }

      // Validate role if provided
      if (updateData.role && !Object.values(ROLES).includes(updateData.role)) {
        throw new Error("Invalid role");
      }

      // Check name uniqueness if changed
      if (updateData.name && updateData.name !== existingUser.name) {
        const nameExists = await this.usersRepo.findByName(updateData.name);
        if (nameExists) {
          throw new Error("User with this name already exists");
        }
      }

      const updatedUser = await this.usersRepo.update(id, updateData);
      const { password: _, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        message: "User updated successfully",
        data: { user: userWithoutPassword },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteUser(id) {
    try {
      const existingUser = await this.usersRepo.findById(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      await this.usersRepo.delete(id);

      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
