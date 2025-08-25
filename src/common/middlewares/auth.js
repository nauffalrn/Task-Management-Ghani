import jwt from "jsonwebtoken";
import { db } from "../../config/db.js";
import { users } from "../../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { ROLES, GLOBAL_ACCESS_ROLES } from "../constants/roles.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        error_code: "NO_TOKEN",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.select().from(users).where(eq(users.id, decoded.id));

    if (!user.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
        error_code: "INVALID_TOKEN",
      });
    }

    req.user = user[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
      error_code: "TOKEN_ERROR",
      details: error.message,
    });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        error_code: "AUTH_REQUIRED",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
        error_code: "INSUFFICIENT_ROLE",
        required_roles: allowedRoles,
        user_role: req.user.role,
      });
    }

    next();
  };
};

export const hasGlobalAccess = (req, res, next) => {
  if (GLOBAL_ACCESS_ROLES.includes(req.user.role)) {
    req.hasGlobalAccess = true;
  }
  next();
};
