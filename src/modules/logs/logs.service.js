import { LogsRepository } from "./logs.repo.js";
import { WorkspacesRepository } from "../workspaces/workspaces.repo.js";
import { GLOBAL_ACCESS_ROLES } from "../../common/constants/roles.js";

export class LogsService {
  constructor() {
    this.logsRepo = new LogsRepository();
    this.workspacesRepo = new WorkspacesRepository();
  }

  async getAllLogs(user, filters = {}) {
    try {
      let logsList;

      // If user has global access, get all logs or filter by workspace
      if (GLOBAL_ACCESS_ROLES.includes(user.role)) {
        logsList = await this.logsRepo.findAll(filters);
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
            throw new Error("Access denied to this workspace");
          }

          logsList = await this.logsRepo.findAll(filters);
          // Filter logs by user's accessible workspaces
          logsList = logsList.filter((log) =>
            workspaceIds.includes(log.workspaceId)
          );
        }
      }

      return {
        success: true,
        message: "Logs retrieved successfully",
        data: { logs: logsList },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getWorkspaceLogs(workspaceId, user) {
    try {
      // Check if workspace exists
      const workspace = await this.workspacesRepo.findById(workspaceId);
      if (!workspace) {
        throw new Error("Workspace not found");
      }

      // Check if user has access to this workspace
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const hasAccess = userWorkspaces.some((ws) => ws.id === workspaceId);

        if (!hasAccess) {
          throw new Error("Access denied to this workspace");
        }
      }

      const logsList = await this.logsRepo.findByWorkspaceId(workspaceId);

      return {
        success: true,
        message: "Workspace logs retrieved successfully",
        data: { logs: logsList },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createLog(logData) {
    try {
      const { workspaceId, taskId, userId, action } = logData;

      // Validate required fields
      if (!workspaceId || !userId || !action) {
        throw new Error("Workspace ID, user ID, and action are required");
      }

      const newLog = await this.logsRepo.create({
        workspaceId,
        taskId: taskId || null,
        userId,
        action,
      });

      return {
        success: true,
        message: "Log created successfully",
        data: { log: newLog },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
