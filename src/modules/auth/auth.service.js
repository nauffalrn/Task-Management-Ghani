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
      console.log("📝 Registering user:", userData.email);

      // Check if user already exists
      const existingUser = await this.repository.findByEmail(userData.email);
      if (existingUser) {
        console.log("❌ User already exists:", userData.email);
        const error = new Error("User already exists with this email");
        error.statusCode = HTTP_STATUS.CONFLICT;
        throw error;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user with default role if not provided
      const newUser = await this.repository.create({
        ...userData,
        password: hashedPassword,
        role: userData.role || "staff_it",
      });

      console.log("✅ User created successfully:", newUser.id);

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      console.error("❌ Registration error:", error);
      if (error.statusCode) throw error;
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      console.log("🔐 Attempting login for:", email);

      // Find user by email
      const user = await this.repository.findByEmail(email);
      if (!user) {
        console.log("❌ User not found:", email);
        const error = new Error("Invalid credentials");
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      console.log("👤 User found:", user.email);

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log("❌ Invalid password for:", email);
        const error = new Error("Invalid credentials");
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      console.log("✅ Password valid, generating tokens...");

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      console.log("✅ Login successful for:", email);

      return {
        user: userWithoutPassword,
        ...tokens,
      };
    } catch (error) {
      console.error("❌ Login error:", error);
      if (error.statusCode) throw error;
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async refreshToken(refreshToken) {
    try {
      const refreshSecret =
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
      const decoded = jwt.verify(refreshToken, refreshSecret);
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

  async getProfile(userId) {
    try {
      const user = await this.repository.findById(userId);
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Get profile failed: ${error.message}`);
    }
  }

  generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Use fallback if JWT_REFRESH_SECRET not set
    const jwtSecret = process.env.JWT_SECRET || "RAHASIAGMI";
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || jwtSecret;
    const jwtExpiresIn =
      process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRES || "1d";
    const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

    console.log("🔑 Generating tokens with config:", {
      secretSet: !!jwtSecret,
      refreshSecretSet: !!jwtRefreshSecret,
      expiresIn: jwtExpiresIn,
    });

    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiresIn,
    });

    const refreshToken = jwt.sign(payload, jwtRefreshSecret, {
      expiresIn: jwtRefreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: jwtExpiresIn,
    };
  }

  verifyToken(token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || "RAHASIAGMI";
      return jwt.verify(token, jwtSecret);
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
