export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let error = {
    success: false,
    message: err.message || "Internal Server Error",
    error_code: "INTERNAL_ERROR",
    timestamp: new Date().toISOString(),
  };

  // Validation errors
  if (err.name === "ValidationError") {
    error.message = "Validation Error";
    error.error_code = "VALIDATION_ERROR";
    error.details = err.details;
    return res.status(400).json(error);
  }

  // Database errors
  if (err.code === "23505") {
    // Unique constraint violation
    error.message = "Resource already exists";
    error.error_code = "DUPLICATE_RESOURCE";
    return res.status(409).json(error);
  }

  if (err.code === "23503") {
    // Foreign key violation
    error.message = "Referenced resource not found";
    error.error_code = "FOREIGN_KEY_ERROR";
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token";
    error.error_code = "INVALID_TOKEN";
    return res.status(401).json(error);
  }

  // Not found errors
  if (err.status === 404) {
    error.message = "Resource not found";
    error.error_code = "NOT_FOUND";
    return res.status(404).json(error);
  }

  // Send error response
  res.status(err.status || 500).json(error);
};

export const notFound = (req, res, next) => {
  const error = new Error(`Endpoint ${req.originalUrl} not found`);
  error.status = 404;
  next(error);
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
