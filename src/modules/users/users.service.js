import bcrypt from "bcryptjs"; // GANTI DARI 'bcrypt' KE 'bcryptjs'
import { BaseService } from "../../common/service/base.service.js";
import { UsersRepository } from "./users.repo.js";
import { HTTP_STATUS, PAGINATION } from "../../common/constants/app.js";
import { ilike } from "drizzle-orm";

export class UsersService extends BaseService {
  constructor() {
    const usersRepo = new UsersRepository();
    super(usersRepo, "User");
  }

  // Override getAll to use safe listing
  async getAll(options = {}) {
    return await this.repository.findAllForListing(options);
  }

  // Override create to handle password hashing
  async create(userData) {
    try {
      // Check if user already exists
      const existingUser = await this.repository.findByEmail(userData.email);
      if (existingUser) {
        const error = new Error("User already exists with this email");
        error.statusCode = HTTP_STATUS.CONFLICT;
        throw error;
      }

      // Hash password if provided
      if (userData.password) {
        const saltRounds = 12;
        userData.password = await bcrypt.hash(userData.password, saltRounds);
      }

      // Create user
      const newUser = await this.repository.create(userData);

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Override update to handle password
  async update(id, userData) {
    try {
      // Check if user exists
      const existingUser = await this.repository.findById(id);
      if (!existingUser) {
        const error = new Error("User not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Check email uniqueness if email is being updated
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await this.repository.findByEmail(userData.email);
        if (emailExists) {
          const error = new Error("Email is already in use");
          error.statusCode = HTTP_STATUS.CONFLICT;
          throw error;
        }
      }

      // Hash password if provided
      if (userData.password) {
        const saltRounds = 12;
        userData.password = await bcrypt.hash(userData.password, saltRounds);
      }

      // Update user
      const updatedUser = await this.repository.update(id, userData);

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async search(query, options = {}) {
    try {
      const searchOptions = {
        page: options.page || PAGINATION.DEFAULT_PAGE,
        limit: options.limit || PAGINATION.DEFAULT_LIMIT,
        ...options,
      };

      const users = await this.repository.search(query, searchOptions);

      // Remove passwords from response
      const usersWithoutPasswords = users.data.map(
        ({ password, ...user }) => user
      );

      return {
        ...users,
        data: usersWithoutPasswords,
      };
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }

  async findAll(options = {}) {
    try {
      const users = await super.findAll(options);

      // Remove passwords from response
      const usersWithoutPasswords = users.data.map(
        ({ password, ...user }) => user
      );

      return {
        ...users,
        data: usersWithoutPasswords,
      };
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const user = await super.findById(id);
      if (!user) {
        return null;
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }
}
