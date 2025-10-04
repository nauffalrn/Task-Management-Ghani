import { BaseService } from "../../common/service/base.service.js";
import { UsersRepository } from "./users.repo.js";
import { AppError } from "../../common/utils/appError.js";
import bcrypt from "bcryptjs";

export class UsersService extends BaseService {
  constructor() {
    super();
    this.usersRepository = new UsersRepository();
  }

  // TAMBAH: Method getAllUsers yang dipanggil controller
  async getAllUsers(options = {}) {
    try {
      const { page = 1, limit = 10, search, role } = options;

      console.log("🔍 UsersService getAllUsers - Options:", options);

      const users = await this.usersRepository.findMany({
        page,
        limit,
        search,
        role,
        excludeFields: ["password"], // Jangan return password
      });

      console.log("✅ UsersService getAllUsers - Found users:", users.length);
      return users;
    } catch (error) {
      console.error("❌ UsersService getAllUsers error:", error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      console.log("🔍 UsersService getUserById - ID:", id);

      const user = await this.usersRepository.findById(id);
      if (!user) {
        throw AppError.notFound("User not found");
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      console.log(
        "✅ UsersService getUserById - User found:",
        userWithoutPassword.email
      );
      return userWithoutPassword;
    } catch (error) {
      console.error("❌ UsersService getUserById error:", error);
      throw error;
    }
  }

  // Update user
  async updateUser(id, updateData) {
    try {
      console.log("🔄 UsersService updateUser - ID:", id, "Data:", updateData);

      // Check if user exists
      const existingUser = await this.usersRepository.findById(id);
      if (!existingUser) {
        throw AppError.notFound("User not found");
      }

      // Hash password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }

      // Check email uniqueness if email is being updated
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await this.usersRepository.findByEmail(
          updateData.email
        );
        if (emailExists) {
          throw AppError.conflict("Email already exists");
        }
      }

      const updatedUser = await this.usersRepository.update(id, updateData);

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;

      console.log(
        "✅ UsersService updateUser - Updated:",
        userWithoutPassword.email
      );
      return userWithoutPassword;
    } catch (error) {
      console.error("❌ UsersService updateUser error:", error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id) {
    try {
      console.log("🗑️ UsersService deleteUser - ID:", id);

      // Check if user exists
      const existingUser = await this.usersRepository.findById(id);
      if (!existingUser) {
        throw AppError.notFound("User not found");
      }

      await this.usersRepository.delete(id);

      console.log(
        "✅ UsersService deleteUser - Deleted user:",
        existingUser.email
      );
      return true;
    } catch (error) {
      console.error("❌ UsersService deleteUser error:", error);
      throw error;
    }
  }

  // Get user by email (for internal use)
  async getUserByEmail(email) {
    try {
      console.log("🔍 UsersService getUserByEmail - Email:", email);

      const user = await this.usersRepository.findByEmail(email);
      if (!user) {
        throw AppError.notFound("User not found");
      }

      console.log("✅ UsersService getUserByEmail - User found:", user.email);
      return user;
    } catch (error) {
      console.error("❌ UsersService getUserByEmail error:", error);
      throw error;
    }
  }

  // Search users by name or email
  async searchUsers(query, options = {}) {
    try {
      console.log("🔍 UsersService searchUsers - Query:", query);

      const users = await this.usersRepository.searchUsers(query, options);

      // Remove passwords from response
      const usersWithoutPasswords = users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      console.log(
        "✅ UsersService searchUsers - Found:",
        usersWithoutPasswords.length
      );
      return usersWithoutPasswords;
    } catch (error) {
      console.error("❌ UsersService searchUsers error:", error);
      throw error;
    }
  }

  // TAMBAH: Create user method
  async createUser(userData) {
    try {
      const { name, email, password, role = "staff_it" } = userData;

      console.log("📝 UsersService createUser - Input data:", {
        name,
        email,
        role,
      });

      // Check if user already exists
      const existingUser = await this.usersRepository.findByEmail(email);
      if (existingUser) {
        throw AppError.conflict("User already exists with this email");
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUser = await this.usersRepository.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;

      console.log(
        "✅ UsersService createUser - User created:",
        userWithoutPassword.email
      );
      return userWithoutPassword;
    } catch (error) {
      console.error("❌ UsersService createUser error:", error);
      throw error;
    }
  }
}
