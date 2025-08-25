import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../config/db.js";
import { users } from "../../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export class AuthService {
  async login(name, password) {
    try {
      // Find user by name
      const user = await db.select().from(users).where(eq(users.name, name));

      if (!user.length) {
        throw new Error("Invalid credentials");
      }

      const foundUser = user[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        foundUser.password
      );

      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: foundUser.id,
          name: foundUser.name,
          role: foundUser.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = foundUser;

      return {
        success: true,
        message: "Login successful",
        data: {
          user: userWithoutPassword,
          token,
          expiresIn: process.env.JWT_EXPIRES,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id));

      if (!user.length) {
        throw new Error("User not found");
      }

      const { password: _, ...userWithoutPassword } = user[0];

      return {
        success: true,
        data: { user: userWithoutPassword },
      };
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}
