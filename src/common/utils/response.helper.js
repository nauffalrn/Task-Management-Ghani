import { HTTP_STATUS } from "../constants/app.js";

export class ResponseHelper {
  static success(res, data = null, message = "Success", statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
      status: "success",
      message,
      data,
    });
  }

  static successWithPagination(res, data, pagination, message = "Success") {
    return res.status(HTTP_STATUS.OK).json({
      status: "success",
      message,
      data,
      pagination,
    });
  }

  static created(res, data, message = "Created successfully") {
    return res.status(HTTP_STATUS.CREATED).json({
      status: "success",
      message,
      data,
    });
  }

  static error(res, message = "Error occurred", statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) {
    const response = {
      status: "error",
      message,
    };
    
    if (details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }

  static notFound(res, message = "Resource not found") {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      status: "error",
      message,
    });
  }

  static badRequest(res, message = "Bad request", details = null) {
    const response = {
      status: "error",
      message,
    };
    
    if (details) {
      response.details = details;
    }

    return res.status(HTTP_STATUS.BAD_REQUEST).json(response);
  }

  static unauthorized(res, message = "Unauthorized") {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      status: "error",
      message,
    });
  }

  static forbidden(res, message = "Forbidden") {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      status: "error",
      message,
    });
  }

  static conflict(res, message = "Resource already exists") {
    return res.status(HTTP_STATUS.CONFLICT).json({
      status: "error",
      message,
    });
  }
}