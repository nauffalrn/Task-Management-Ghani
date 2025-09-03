import { BaseController } from "../../common/controller/base.controller.js";
import { LogsService } from "./logs.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";

export class LogsController extends BaseController {
  constructor() {
    const logsService = new LogsService();
    super(logsService, "Log");
  }

  async getAllLogs(req, res, next) {
    try {
      const { workspaceId, userId, taskId, action } = req.query;

      const filters = {};
      if (workspaceId) filters.workspaceId = parseInt(workspaceId);
      if (userId) filters.userId = parseInt(userId);
      if (taskId) filters.taskId = parseInt(taskId);
      if (action) filters.action = action;

      const logs = await this.service.getAllLogs(req.user, filters);

      return ResponseHelper.success(res, logs, "Logs retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceLogs(req, res, next) {
    try {
      const { workspaceId } = req.params;
      const logs = await this.service.getWorkspaceLogs(
        parseInt(workspaceId),
        req.user
      );

      return ResponseHelper.success(
        res,
        logs,
        "Workspace logs retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Override create to add user context
  async create(req, res, next) {
    try {
      const logData = {
        ...req.body,
        userId: req.user.userId, // From auth middleware
      };

      const result = await this.service.create(logData);
      return ResponseHelper.created(res, result, "Log created successfully");
    } catch (error) {
      next(error);
    }
  }
}

// Export individual functions for routes
const controller = new LogsController();

export const getLogs = (req, res, next) =>
  controller.getAllLogs(req, res, next);

export const getWorkspaceLogs = (req, res, next) =>
  controller.getWorkspaceLogs(req, res, next);

export const createLog = (req, res, next) => controller.create(req, res, next);
