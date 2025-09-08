import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";
import { JWT_CONFIG } from "../constants/app.js";
import { UsersRepository } from "../../modules/users/users.repo.js";

const usersRepo = new UsersRepository();

export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw AppError.unauthorized("Access token is required");
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET);

    // Get user from token
    const user = await usersRepo.findById(decoded.id);
    if (!user) {
      throw AppError.unauthorized("User no longer exists");
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(AppError.unauthorized("Invalid token"));
    }
    if (error.name === "TokenExpiredError") {
      return next(AppError.unauthorized("Token expired"));
    }
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden("Insufficient permissions for this action");
    }
    next();
  };
};

// Fix auth routes import
export const authenticateToken = authenticate;
