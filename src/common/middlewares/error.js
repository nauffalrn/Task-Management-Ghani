import { ResponseHelper } from "../utils/response.helper.js";
import { HTTP_STATUS } from "../constants/app.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/appError.js";

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id || "anonymous",
  });

  // === MONGOOSE/DATABASE ERRORS ===
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = AppError.notFound(message);
  }

  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = AppError.conflict(message);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = AppError.badRequest(message.join(", "));
  }

  // === JWT ERRORS ===
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = AppError.unauthorized(message);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = AppError.unauthorized(message);
  }

  // === DRIZZLE/POSTGRES ERRORS ===
  if (err.name === "DrizzleQueryError") {
    const message = "Database query error";
    error = AppError.internalServer(message);
  }

  // PostgreSQL specific errors
  if (err.code === "23505") {
    // Unique constraint violation
    const message = "Duplicate entry";
    error = AppError.conflict(message);
  }

  if (err.code === "23503") {
    // Foreign key constraint violation
    const message = "Referenced record not found";
    error = AppError.badRequest(message);
  }

  if (err.code === "23502") {
    // Not null constraint violation
    const message = "Required field missing";
    error = AppError.badRequest(message);
  }

  // === MULTER UPLOAD ERRORS ===
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "File too large";
    error = AppError.badRequest(message);
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    const message = "Too many files";
    error = AppError.badRequest(message);
  }

  // === SEND ERROR RESPONSE ===
  res.status(error.statusCode || 500).json({
    status: error.status || "error",
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
};

// Async wrapper untuk handle async errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
