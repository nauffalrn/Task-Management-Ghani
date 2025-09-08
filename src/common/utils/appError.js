export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;

    // Capture stack trace (exclude constructor from stack)
    Error.captureStackTrace(this, this.constructor);
  }

  // Static methods untuk common errors
  static badRequest(message = "Bad Request") {
    return new AppError(message, 400);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }

  static notFound(message = "Not Found") {
    return new AppError(message, 404);
  }

  static conflict(message = "Conflict") {
    return new AppError(message, 409);
  }

  static unprocessableEntity(message = "Unprocessable Entity") {
    return new AppError(message, 422);
  }

  static internalServer(message = "Internal Server Error") {
    return new AppError(message, 500);
  }

  // Check if error is operational (expected) or programming error
  static isOperational(error) {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }
}
