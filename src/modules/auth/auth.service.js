import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { BaseService } from "../../common/service/base.service.js";
import { UsersRepository } from "../users/users.repo.js";
import { HTTP_STATUS } from "../../common/constants/app.js";

export class AuthService extends BaseService {
  constructor() {
    const usersRepo = new UsersRepository();
    super(usersRepo, "User");
  }

  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await this.repository.findByEmail(userData.email);
      if (existingUser) {
        const error = new Error("User already exists with this email");
        error.statusCode = HTTP_STATUS.CONFLICT;
        throw error;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const newUser = await this.repository.create({
        ...userData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      // Find user by email
      const user = await this.repository.findByEmail(email);
      if (!user) {
        const error = new Error("Invalid credentials");
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        const error = new Error("Invalid credentials");
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        ...tokens,
      };
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await this.repository.findById(decoded.userId);

      if (!user) {
        const error = new Error("Invalid refresh token");
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      return this.generateTokens(user);
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        const tokenError = new Error("Invalid or expired refresh token");
        tokenError.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw tokenError;
      }
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.repository.findById(userId);
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        const error = new Error("Current password is incorrect");
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await this.repository.update(userId, { password: hashedPassword });

      return { message: "Password changed successfully" };
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Password change failed: ${error.message}`);
    }
  }

  generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        const tokenError = new Error("Invalid token");
        tokenError.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw tokenError;
      }
      if (error.name === "TokenExpiredError") {
        const tokenError = new Error("Token expired");
        tokenError.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw tokenError;
      }
      throw error;
    }
  }
}
