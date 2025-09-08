import { BaseController } from "../../common/controller/base.controller.js";
import { TasksService } from "./tasks.service.js";

class TasksController extends BaseController {
  constructor() {
    super();
    this.tasksService = new TasksService();
  }

  getAllTasks = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        workspaceId,
        assigneeId,
        status,
        priority,
        search,
        overdue,
      } = req.query;

      const result = await this.tasksService.getAllTasks({
        page: parseInt(page),
        limit: parseInt(limit),
        workspaceId: workspaceId ? parseInt(workspaceId) : undefined,
        assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
        status,
        priority,
        search,
        overdue: overdue === "true",
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Tasks retrieved successfully",
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

  getTaskById = async (req, res) => {
    try {
      const { id } = req.params;

      const task = await this.tasksService.getTaskById(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(res, "Task retrieved successfully", task);
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  createTask = async (req, res) => {
    try {
      const taskData = req.body;

      const task = await this.tasksService.createTask(taskData, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Task created successfully",
        task,
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

  updateTask = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const task = await this.tasksService.updateTask(id, updateData, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(res, "Task updated successfully", task);
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  updateTaskStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const task = await this.tasksService.updateTaskStatus(id, status, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Task status updated successfully",
        task
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  deleteTask = async (req, res) => {
    try {
      const { id } = req.params;

      await this.tasksService.deleteTask(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(res, "Task deleted successfully");
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  getTasksByWorkspace = async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const { page = 1, limit = 10, status, priority } = req.query;

      const result = await this.tasksService.getTasksByWorkspace(workspaceId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        priority,
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Workspace tasks retrieved successfully",
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

  getTasksByAssignee = async (req, res) => {
    try {
      const { assigneeId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const result = await this.tasksService.getTasksByAssignee(assigneeId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "User tasks retrieved successfully",
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
}

const tasksController = new TasksController();

export const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTasksByWorkspace,
  getTasksByAssignee,
} = tasksController;
