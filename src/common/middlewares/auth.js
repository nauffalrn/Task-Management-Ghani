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

    // PERBAIKAN: Extract token dengan benar
    let token = authHeader.substring(7); // Remove 'Bearer '
    console.log("🎫 Token Before Cleanup:", token);

    // TAMBAH: Bersihkan token dari refreshToken atau karakter tambahan
    if (token.includes(",")) {
      token = token.split(",")[0].trim(); // Ambil bagian pertama sebelum koma
      console.log("🧹 Token After Comma Split:", token);
    }

    if (token.includes('"')) {
      token = token.replace(/"/g, ""); // Hapus semua quotes
      console.log("🧹 Token After Quote Removal:", token);
    }

    // TAMBAH: Validasi format token JWT (3 bagian dipisah titik)
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      console.log("❌ Invalid JWT format - parts count:", tokenParts.length);
      console.log("❌ Token parts:", tokenParts);
      throw AppError.unauthorized("Invalid token format");
    }

    console.log("🎫 Final Clean Token:", token);
    console.log("🎫 Token Length:", token.length);

    // Verify JWT
    console.log("🔑 JWT Secret exists:", !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified successfully");
    console.log("👤 Decoded user:", {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    // Add user to request
    req.user = decoded;
    next();
  } catch (error) {
    console.log("❌ =================================");
    console.log("❌ AUTH MIDDLEWARE ERROR");
    console.log("❌ =================================");
    console.log("❌ Error type:", error.name);
    console.log("❌ Error message:", error.message);
    console.log("❌ Error stack:", error.stack);

    if (error.name === "JsonWebTokenError") {
      console.log("❌ JWT verification failed");
      return next(AppError.unauthorized("Invalid token format"));
    }

    if (error.name === "TokenExpiredError") {
      console.log("❌ JWT token expired");
      return next(AppError.unauthorized("Token expired"));
    }

    next(error);
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
