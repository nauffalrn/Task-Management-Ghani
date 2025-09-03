import { BaseService } from "../../common/service/base.service.js";
import { TasksRepository } from "./tasks.repo.js";
import { TASK_STATUS, HTTP_STATUS } from "../../common/constants/app.js";

export class TasksService extends BaseService {
  constructor() {
    const tasksRepo = new TasksRepository();
    super(tasksRepo, "Task");
  }

  async getTasks(options = {}) {
    return await this.repository.findAll(options);
  }

  async getTasksByWorkspace(workspaceId, options = {}) {
    if (!workspaceId) {
      throw new Error("Workspace ID is required");
    }
    return await this.repository.findByWorkspaceId(workspaceId, options);
  }

  async getTasksByAssignee(userId, options = {}) {
    if (!userId) {
      throw new Error("User ID is required");
    }
    return await this.repository.findByAssignedUser(userId, options);
  }

  async getTaskWithDetails(taskId) {
    if (!taskId) {
      throw new Error("Task ID is required");
    }
    return await this.repository.findWithDetails(taskId);
  }

  // Override create to add validation
  async create(taskData) {
    try {
      // Validate required fields
      if (!taskData.title || !taskData.workspaceId || !taskData.createdBy) {
        const error = new Error(
          "Title, workspace ID, and creator ID are required"
        );
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      // Set default status if not provided
      if (!taskData.status) {
        taskData.status = TASK_STATUS.TODO;
      }

      return await this.repository.create(taskData);
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  async updateStatus(taskId, newStatus, userId) {
    try {
      if (!taskId || !newStatus || !userId) {
        const error = new Error("Task ID, status, and user ID are required");
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      // Validate status
      const validStatuses = Object.values(TASK_STATUS);
      if (!validStatuses.includes(newStatus)) {
        const error = new Error(
          `Invalid status. Valid statuses: ${validStatuses.join(", ")}`
        );
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      return await this.repository.update(taskId, {
        status: newStatus,
        updatedBy: userId,
      });
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to update task status: ${error.message}`);
    }
  }

  async getTaskStats(workspaceId = null) {
    try {
      return await this.repository.countByStatus(workspaceId);
    } catch (error) {
      throw new Error(`Failed to get task statistics: ${error.message}`);
    }
  }
}
