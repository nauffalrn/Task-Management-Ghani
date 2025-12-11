import { BaseController } from "../../common/controller/base.controller.js";
import { LogsService } from "./logs.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";

class LogsController extends BaseController {
  constructor() {
    super();
    this.logsService = new LogsService();
  }

  // GET /api/logs - List all logs
  getLogs = async (req, res, next) => {
    try {
      const { page = 1, limit = 10, workspaceId, action } = req.query;

      const logs = await this.logsService.getAllLogs({
        page: parseInt(page),
        limit: parseInt(limit),
        workspaceId: workspaceId ? parseInt(workspaceId) : undefined,
        action,
      });

      return ResponseHelper.success(res, logs, "Logs retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  // GET /api/logs/:id - Get log by ID
  getLogById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const log = await this.logsService.getLogById(id);

      return ResponseHelper.success(res, log, "Log retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  // GET /api/logs/workspace/:workspaceId - Get logs by workspace
  getLogsByWorkspace = async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const logs = await this.logsService.getLogsByWorkspace(workspaceId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return ResponseHelper.success(
        res,
        logs,
        "Workspace logs retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/logs/my - Get current user's logs
  getLogsByUser = async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10 } = req.query;

      const logs = await this.logsService.getLogsByUser(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return ResponseHelper.success(
        res,
        logs,
        "User logs retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };
}

export const logsController = new LogsController();
export { LogsController };

// Export individual methods untuk routes
export const getLogs = logsController.getLogs;
export const getLogById = logsController.getLogById;
export const getLogsByWorkspace = logsController.getLogsByWorkspace;
export const getLogsByUser = logsController.getLogsByUser;
