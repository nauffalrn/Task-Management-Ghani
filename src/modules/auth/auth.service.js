import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { BaseService } from "../../common/service/base.service.js";
import { UsersRepository } from "../users/users.repo.js";
import { AppError } from "../../common/utils/appError.js";

export class AuthService extends BaseService {
  constructor() {
    super();
    this.usersRepository = new UsersRepository();
  }

  async register(userData) {
    try {
      const { name, email, password, role = "staff_it" } = userData;

      console.log("📝 AuthService register - Input data:", {
        name,
        email,
        role,
      });

      // Check if user already exists
      const existingUser = await this.usersRepository.findByEmail(email);
      if (existingUser) {
        console.log("❌ User already exists:", email);
        throw AppError.conflict("User already exists with this email");
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log("✅ Password hashed successfully");

      // Create user
      const newUser = await this.usersRepository.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      console.log("✅ User created successfully:", newUser.id);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: "1d",
      };
    } catch (error) {
      console.error("❌ AuthService register error:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internalServerError("Failed to register user");
    }
  }

  async login(email, password) {
    try {
      console.log("🔐 AuthService login - Attempting login for:", email);

      // Find user by email
      const user = await this.usersRepository.findByEmail(email);
      console.log("👤 User found:", user ? user.email : "none");

      if (!user) {
        throw AppError.unauthorized("Invalid email or password");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log("✅ Password valid, generating tokens...");

      if (!isPasswordValid) {
        throw AppError.unauthorized("Invalid email or password");
      }

      // Generate tokens
      const jwtSecret = process.env.JWT_SECRET || "RAHASIAGMI";
      const refreshSecret =
        process.env.JWT_REFRESH_SECRET || "RAHASIAGMIREFRESH";
      const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

      console.log("🔑 Generating tokens with config:", {
        secretSet: !!jwtSecret,
        refreshSecretSet: !!refreshSecret,
        expiresIn,
      });

      const payload = {
        userId: user.id, // PASTIKAN INI userId
        email: user.email,
        role: user.role,
      };

      const accessToken = jwt.sign(payload, jwtSecret, { expiresIn });
      const refreshToken = jwt.sign(payload, refreshSecret, {
        expiresIn: "7d",
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      console.log("✅ Login successful for:", email);

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn,
      };
    } catch (error) {
      console.error("❌ Login error:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internalServerError("Login failed");
    }
  }

  async getProfile(userId) {
    try {
      console.log(
        "👤 AuthService getProfile - Getting profile for userId:",
        userId
      );
      console.log("👤 AuthService getProfile - Type of userId:", typeof userId);

      const user = await this.usersRepository.findById(userId);
      console.log(
        "👤 Found user:",
        user ? `${user.name} (${user.email})` : "none"
      );

      if (!user) {
        throw AppError.notFound("User not found");
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error("❌ AuthService getProfile error:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internalServerError("Failed to get user profile");
    }
  }

  async refreshToken(refreshToken) {
    try {
      const refreshSecret =
        process.env.JWT_REFRESH_SECRET || "RAHASIAGMIREFRESH";
      const decoded = jwt.verify(refreshToken, refreshSecret);

      // Generate new access token
      const { accessToken } = this.generateTokens({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });

      return { accessToken, expiresIn: "1d" };
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw AppError.unauthorized("Refresh token has expired");
      }
      if (error.name === "JsonWebTokenError") {
        throw AppError.unauthorized("Invalid refresh token");
      }
      throw AppError.unauthorized("Token refresh failed");
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw AppError.notFound("User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        throw AppError.badRequest("Current password is incorrect");
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await this.usersRepository.update(userId, {
        password: hashedNewPassword,
      });

      return { message: "Password changed successfully" };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internalServerError("Failed to change password");
    }
  }

  generateTokens(payload) {
    const jwtSecret = process.env.JWT_SECRET || "RAHASIAGMI";
    const refreshSecret = process.env.JWT_REFRESH_SECRET || "RAHASIAGMIREFRESH";
    const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn });
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "7d" });

    return { accessToken, refreshToken };
  }
}
