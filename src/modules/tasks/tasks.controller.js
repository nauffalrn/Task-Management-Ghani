import { BaseController } from "../../common/controller/base.controller.js";
import { TasksService } from "./tasks.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";
import { PAGINATION } from "../../common/constants/app.js";

export class TasksController extends BaseController {
  constructor() {
    const tasksService = new TasksService();
    super(tasksService, "Task");
  }

  // Override getAll to handle task-specific filters
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(
        parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
        PAGINATION.MAX_LIMIT
      );
      const search = req.query.search || "";
      const status = req.query.status || "";
      const priority = req.query.priority || "";
      const workspaceId = req.query.workspaceId;
      const assignedTo = req.query.assignedTo;

      const offset = (page - 1) * limit;
      const result = await this.service.getTasks({
        limit,
        offset,
        search,
        status,
        priority,
        workspaceId,
        assignedTo,
      });

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
        "Tasks retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Override create to add user context
  async create(req, res, next) {
    try {
      const taskData = {
        ...req.body,
        createdBy: req.user.userId, // From auth middleware
      };

      const result = await this.service.create(taskData);
      return ResponseHelper.created(res, result, "Task created successfully");
    } catch (error) {
      next(error);
    }
  }

  // Custom method: Get task with details
  async getTaskWithDetails(req, res, next) {
    try {
      const { id } = req.params;
      const task = await this.service.getTaskWithDetails(id);

      if (!task) {
        return ResponseHelper.notFound(res, "Task not found");
      }

      return ResponseHelper.success(
        res,
        task,
        "Task details retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Custom method: Update task status
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.userId;

      const result = await this.service.updateStatus(id, status, userId);

      if (!result) {
        return ResponseHelper.notFound(res, "Task not found");
      }

      return ResponseHelper.success(
        res,
        result,
        "Task status updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Custom method: Get tasks by workspace
  async getByWorkspace(req, res, next) {
    try {
      const { workspaceId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(
        parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
        PAGINATION.MAX_LIMIT
      );
      const search = req.query.search || "";
      const status = req.query.status || "";
      const priority = req.query.priority || "";

      const offset = (page - 1) * limit;
      const result = await this.service.getTasksByWorkspace(workspaceId, {
        limit,
        offset,
        search,
        status,
        priority,
      });

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
        "Workspace tasks retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Custom method: Get task statistics
  async getStats(req, res, next) {
    try {
      const { workspaceId } = req.query;
      const stats = await this.service.getTaskStats(workspaceId);

      return ResponseHelper.success(
        res,
        stats,
        "Task statistics retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}
