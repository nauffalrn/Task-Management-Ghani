import { ResponseHelper } from "../utils/response.helper.js";
import { HTTP_STATUS } from "../constants/app.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Handle custom errors with statusCode
  if (err.statusCode) {
    return ResponseHelper.error(res, err.message, err.statusCode);
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    return ResponseHelper.badRequest(
      res,
      "Validation error",
      err.details || err.message
    );
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return ResponseHelper.unauthorized(res, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return ResponseHelper.unauthorized(res, "Token expired");
  }

  // Handle database errors
  if (err.code === "23505") {
    // PostgreSQL unique violation
    return ResponseHelper.conflict(res, "Resource already exists");
  }

  if (err.code === "23503") {
    // PostgreSQL foreign key violation
    return ResponseHelper.badRequest(
      res,
      "Invalid reference to related resource"
    );
  }

  if (err.code === "23502") {
    // PostgreSQL not null violation
    return ResponseHelper.badRequest(res, "Required field is missing");
  }

  // Handle Multer errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return ResponseHelper.badRequest(res, "File too large");
    }
    return ResponseHelper.badRequest(res, err.message);
  }

  // Default server error
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  return ResponseHelper.error(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

export const notFoundHandler = (req, res) => {
  ResponseHelper.notFound(res, "Route not found");
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
