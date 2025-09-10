import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";

export const authenticate = async (req, res, next) => {
  try {
    console.log("🔐 =================================");
    console.log("🔐 AUTH MIDDLEWARE STARTED");
    console.log("🔐 =================================");

    // Log semua headers
    console.log("📋 All Headers:", JSON.stringify(req.headers, null, 2));

    const authHeader = req.headers.authorization;
    console.log("🔍 Auth Header Raw:", authHeader);
    console.log("🔍 Auth Header Type:", typeof authHeader);
    console.log("🔍 Auth Header Length:", authHeader?.length);

    if (!authHeader) {
      console.log("❌ No authorization header found");
      throw AppError.unauthorized("Access token is required");
    }

    console.log("🔍 Checking if starts with 'Bearer '");
    console.log("🔍 Starts with Bearer:", authHeader.startsWith("Bearer "));

    if (!authHeader.startsWith("Bearer ")) {
      console.log(
        "❌ Invalid authorization format - doesn't start with Bearer"
      );
      console.log("🔍 First 20 chars:", authHeader.substring(0, 20));
      throw AppError.unauthorized(
        "Invalid authorization format. Use: Bearer <token>"
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    console.log("🎫 Extracted Token Length:", token.length);
    console.log("🎫 Token Preview:", token.substring(0, 50) + "...");
    console.log("🎫 Token End:", "..." + token.substring(token.length - 10));

    if (!token || token.trim() === "") {
      console.log("❌ Empty token after extraction");
      throw AppError.unauthorized("Access token is required");
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || "RAHASIAGMI";
    console.log("🔑 JWT Secret exists:", !!jwtSecret);
    console.log("🔑 JWT Secret preview:", jwtSecret.substring(0, 5) + "...");

    console.log("🔍 Attempting to verify token...");
    const decoded = jwt.verify(token, jwtSecret);

    console.log("✅ Token decoded successfully!");
    console.log("👤 Decoded payload:", {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      iat: new Date(decoded.iat * 1000).toISOString(),
      exp: new Date(decoded.exp * 1000).toISOString(),
      isExpired: decoded.exp < Math.floor(Date.now() / 1000),
    });

    req.user = decoded;
    console.log("✅ AUTH MIDDLEWARE SUCCESS - proceeding to next middleware");
    console.log("🔐 =================================");
    next();
  } catch (error) {
    console.log("❌ =================================");
    console.log("❌ AUTH MIDDLEWARE ERROR");
    console.log("❌ =================================");
    console.error("❌ Error type:", error.constructor.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);

    if (error.name === "TokenExpiredError") {
      console.log("❌ Token has expired");
      throw AppError.unauthorized("Token has expired");
    }

    if (error.name === "JsonWebTokenError") {
      console.log("❌ JWT verification failed");
      throw AppError.unauthorized("Invalid token format");
    }

    if (error.name === "NotBeforeError") {
      console.log("❌ Token not active yet");
      throw AppError.unauthorized("Token not active yet");
    }

    // Re-throw if it's already an AppError
    if (error instanceof AppError) {
      throw error;
    }

    // Generic error
    console.log("❌ Generic auth error");
    throw AppError.unauthorized("Authentication failed");
  }
};

// ALIAS EXPORTS - untuk backward compatibility
export const authenticateToken = authenticate;
export const authMiddleware = authenticate;

export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      console.log("🔒 Authorization check for roles:", allowedRoles);
      console.log("👤 User role:", req.user?.role);

      if (!req.user) {
        throw AppError.unauthorized("Authentication required");
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        console.log("❌ Insufficient permissions");
        throw AppError.forbidden("Insufficient permissions for this resource");
      }

      console.log("✅ Authorization successful");
      next();
    } catch (error) {
      console.error("❌ Authorization error:", error);
      throw error;
    }
  };
};

// ALIAS EXPORTS - untuk backward compatibility
export const authorizeRoles = authorize;
