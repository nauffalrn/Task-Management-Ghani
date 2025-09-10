import { ResponseHelper } from "../utils/response.helper.js";
import { PAGINATION } from "../constants/app.js";

export class BaseController {
  constructor(service, entityName = "record") {
    this.service = service;
    this.entityName = entityName;
  }

  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(
        parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
        PAGINATION.MAX_LIMIT
      );
      const search = req.query.search || "";
      const offset = (page - 1) * limit;

      const result = await this.service.getAll({ limit, offset, search });

      const pagination = {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      };

      return ResponseHelper.successWithPagination(
        res,
        result.data,
        pagination,
        `${this.entityName}s retrieved successfully`
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.service.getById(id);

      if (!result) {
        return ResponseHelper.notFound(res, `${this.entityName} not found`);
      }

      return ResponseHelper.success(
        res,
        result,
        `${this.entityName} retrieved successfully`
      );
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await this.service.create(req.body);
      return ResponseHelper.created(
        res,
        result,
        `${this.entityName} created successfully`
      );
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.service.update(id, req.body);

      if (!result) {
        return ResponseHelper.notFound(res, `${this.entityName} not found`);
      }

      return ResponseHelper.success(
        res,
        result,
        `${this.entityName} updated successfully`
      );
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.service.delete(id);

      if (!result) {
        return ResponseHelper.notFound(res, `${this.entityName} not found`);
      }

      return ResponseHelper.success(
        res,
        null,
        `${this.entityName} deleted successfully`
      );
    } catch (error) {
      next(error);
    }
  }

  sendSuccessResponse(
    res,
    message,
    data = null,
    pagination = null,
    statusCode = 200
  ) {
    const response = {
      status: "success",
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    if (pagination) {
      response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
  }

  sendErrorResponse(res, message, statusCode = 500, errors = null) {
    const response = {
      status: "error",
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  sendFailResponse(res, message, statusCode = 400) {
    return res.status(statusCode).json({
      status: "fail",
      message,
    });
  }
}
