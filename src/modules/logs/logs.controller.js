import { BaseController } from "../../common/controller/base.controller.js";
import { LogsService } from "./logs.service.js";

class LogsController extends BaseController {
  constructor() {
    super();
    this.logsService = new LogsService();
  }

  getAllLogs = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        action,
        userId,
        workspaceId,
        dateFrom,
        dateTo,
      } = req.query;

      const result = await this.logsService.getAllLogs({
        page: parseInt(page),
        limit: parseInt(limit),
        action,
        userId: userId ? parseInt(userId) : undefined,
        workspaceId: workspaceId ? parseInt(workspaceId) : undefined,
        dateFrom,
        dateTo,
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Activity logs retrieved successfully",
        result.data,
        result.meta
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  getLogById = async (req, res) => {
    try {
      const { id } = req.params;

      const log = await this.logsService.getLogById(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(res, "Log retrieved successfully", log);
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  getWorkspaceLogs = async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const { page = 1, limit = 10, action, dateFrom, dateTo } = req.query;

      const result = await this.logsService.getWorkspaceLogs(workspaceId, {
        page: parseInt(page),
        limit: parseInt(limit),
        action,
        dateFrom,
        dateTo,
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Workspace activity logs retrieved successfully",
        result.data,
        result.meta
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  getTaskLogs = async (req, res) => {
    try {
      const { taskId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.logsService.getTaskLogs(taskId, {
        page: parseInt(page),
        limit: parseInt(limit),
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Task activity logs retrieved successfully",
        result.data,
        result.meta
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  getUserLogs = async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, action, dateFrom, dateTo } = req.query;

      const result = await this.logsService.getUserLogs(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        action,
        dateFrom,
        dateTo,
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "User activity logs retrieved successfully",
        result.data,
        result.meta
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  createLog = async (req, res) => {
    try {
      const logData = req.body;

      const log = await this.logsService.createLog(logData, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Log created successfully",
        log,
        null,
        201
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  deleteLog = async (req, res) => {
    try {
      const { id } = req.params;

      await this.logsService.deleteLog(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(res, "Log deleted successfully");
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };
}

const logsController = new LogsController();

export const {
  getAllLogs,
  getLogById,
  getWorkspaceLogs,
  getTaskLogs,
  getUserLogs,
  createLog,
  deleteLog,
} = logsController;
