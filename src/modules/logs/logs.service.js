import { BaseService } from "../../common/service/base.service.js";
import { LogsRepository } from "./logs.repo.js";
import { WorkspacesRepository } from "../workspaces/workspaces.repo.js";
import { GLOBAL_ACCESS_ROLES } from "../../common/constants/roles.js";
import { HTTP_STATUS } from "../../common/constants/app.js";

export class LogsService extends BaseService {
  constructor() {
    const logsRepo = new LogsRepository();
    super(logsRepo, "Log");
    this.workspacesRepo = new WorkspacesRepository();
  }

  async getAllLogs(user, filters = {}) {
    try {
      let logsList;

      // If user has global access, get all logs or filter by workspace
      if (GLOBAL_ACCESS_ROLES.includes(user.role)) {
        logsList = await this.repository.findAll(filters);
      } else {
        // Get logs from user's workspaces only
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const workspaceIds = userWorkspaces.map((ws) => ws.id);

        if (workspaceIds.length === 0) {
          logsList = [];
        } else {
          // If workspace filter is provided, check if user has access
          if (
            filters.workspaceId &&
            !workspaceIds.includes(filters.workspaceId)
          ) {
            const error = new Error("Access denied to this workspace");
            error.statusCode = HTTP_STATUS.FORBIDDEN;
            throw error;
          }

          logsList = await this.repository.findAll(filters);
          // Filter logs by user's accessible workspaces
          logsList = logsList.filter((log) =>
            workspaceIds.includes(log.workspaceId)
          );
        }
      }

      return logsList;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to get logs: ${error.message}`);
    }
  }

  async getWorkspaceLogs(workspaceId, user) {
    try {
      // Check if workspace exists
      const workspace = await this.workspacesRepo.findById(workspaceId);
      if (!workspace) {
        const error = new Error("Workspace not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Check if user has access to this workspace
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const hasAccess = userWorkspaces.some((ws) => ws.id === workspaceId);

        if (!hasAccess) {
          const error = new Error("Access denied to this workspace");
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }
      }

      const logsList = await this.repository.findByWorkspaceId(workspaceId);
      return logsList;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to get workspace logs: ${error.message}`);
    }
  }

  // Override create to add validation
  async create(logData) {
    try {
      const { workspaceId, taskId, userId, action } = logData;

      // Validate required fields
      if (!workspaceId || !userId || !action) {
        const error = new Error(
          "Workspace ID, user ID, and action are required"
        );
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      return await this.repository.create({
        workspaceId,
        taskId: taskId || null,
        userId,
        action,
      });
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to create log: ${error.message}`);
    }
  }
}
