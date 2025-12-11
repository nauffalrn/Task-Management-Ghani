import { BaseService } from "../../common/service/base.service.js";
import { LogsRepository } from "./logs.repo.js";
import { WorkspacesRepository } from "../workspaces/workspaces.repo.js";
import { AppError } from "../../common/utils/appError.js";

export class LogsService extends BaseService {
  constructor() {
    super();
    this.logsRepository = new LogsRepository();
    this.workspacesRepository = new WorkspacesRepository();
  }

  // Get all logs
  async getAllLogs(options = {}) {
    try {
      const { page = 1, limit = 10, workspaceId, action } = options;

      console.log("🔍 LogsService getAllLogs - Options:", options);

      const logs = await this.logsRepository.findMany({
        page,
        limit,
        workspaceId,
        action,
      });

      console.log("✅ LogsService getAllLogs - Found:", logs.length);
      return logs;
    } catch (error) {
      console.error("❌ LogsService getAllLogs error:", error);
      throw error;
    }
  }

  // Create log entry (PERBAIKAN: sesuai field database)
  async createLog(logData) {
    try {
      console.log("📝 LogsService createLog - Data:", logData);

      // PERBAIKAN: Hanya gunakan field yang ada di database
      const { workspaceId, taskId, userId, action } = logData;

      const newLog = await this.logsRepository.create({
        workspaceId,
        taskId, // BARU: field yang ada di database
        userId,
        action,
      });

      console.log("✅ LogsService createLog - Created:", newLog.id);
      return newLog;
    } catch (error) {
      console.error("❌ LogsService createLog error:", error);
      throw error;
    }
  }

  // Method lain tetap sama tapi hapus reference ke field yang tidak ada
  async getLogById(id) {
    try {
      console.log("🔍 LogsService getLogById - ID:", id);

      const log = await this.logsRepository.findById(id);
      if (!log) {
        throw AppError.notFound("Log not found");
      }

      console.log("✅ LogsService getLogById - Found:", log.action);
      return log;
    } catch (error) {
      console.error("❌ LogsService getLogById error:", error);
      throw error;
    }
  }

  async getLogsByWorkspace(workspaceId, options = {}) {
    try {
      console.log(
        "🔍 LogsService getLogsByWorkspace - WorkspaceId:",
        workspaceId
      );

      // Validate workspace exists
      const workspace = await this.workspacesRepository.findById(workspaceId);
      if (!workspace) {
        throw AppError.notFound("Workspace not found");
      }

      const logs = await this.logsRepository.findByWorkspaceId(
        workspaceId,
        options
      );

      console.log("✅ LogsService getLogsByWorkspace - Found:", logs.length);
      return logs;
    } catch (error) {
      console.error("❌ LogsService getLogsByWorkspace error:", error);
      throw error;
    }
  }

  async getLogsByUser(userId, options = {}) {
    try {
      console.log("🔍 LogsService getLogsByUser - UserId:", userId);

      const logs = await this.logsRepository.findByUserId(userId, options);

      console.log("✅ LogsService getLogsByUser - Found:", logs.length);
      return logs;
    } catch (error) {
      console.error("❌ LogsService getLogsByUser error:", error);
      throw error;
    }
  }
}
