import jwt from "jsonwebtoken";
import { ResponseHelper } from "../utils/response.helper.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return ResponseHelper.unauthorized(res, "Access token is required");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return ResponseHelper.unauthorized(res, "Invalid access token");
    }
    if (error.name === "TokenExpiredError") {
      return ResponseHelper.unauthorized(res, "Access token expired");
    }
    return ResponseHelper.error(res, "Authentication failed", 500);
  }
};
