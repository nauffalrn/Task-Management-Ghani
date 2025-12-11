import { BaseController } from "../../common/controller/base.controller.js";
import { TasksService } from "./tasks.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";

class TasksController extends BaseController {
  constructor() {
    super();
    this.tasksService = new TasksService();
  }

  // GET /api/tasks - List all tasks
  getTasks = async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        workspaceId,
        status,
        assignedTo,
      } = req.query;

      const tasks = await this.tasksService.getAllTasks({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        workspaceId: workspaceId ? parseInt(workspaceId) : undefined,
        status,
        assignedTo: assignedTo ? parseInt(assignedTo) : undefined,
      });

      return ResponseHelper.success(res, tasks, "Tasks retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  // GET /api/tasks/:id - Get task by ID
  getTaskById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const task = await this.tasksService.getTaskById(id);

      return ResponseHelper.success(res, task, "Task retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  // POST /api/tasks - Create task
  createTask = async (req, res, next) => {
    try {
      const taskData = req.body;
      const userId = req.user.userId;

      const task = await this.tasksService.createTask(taskData, userId);

      return ResponseHelper.created(res, task, "Task created successfully");
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/tasks/:id - Update task
  updateTask = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;

      const task = await this.tasksService.updateTask(id, updateData, userId);

      return ResponseHelper.success(res, task, "Task updated successfully");
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/tasks/:id - Delete task
  deleteTask = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await this.tasksService.deleteTask(id, userId);

      return ResponseHelper.success(res, null, "Task deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  // GET /api/tasks/workspace/:workspaceId - Get tasks by workspace
  getTasksByWorkspace = async (req, res, next) => {
    try {
      const { workspaceId } = req.params;

      const tasks = await this.tasksService.getTasksByWorkspace(workspaceId);

      return ResponseHelper.success(
        res,
        tasks,
        "Workspace tasks retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/tasks/my - Get current user's assigned tasks
  getMyTasks = async (req, res, next) => {
    try {
      const userId = req.user.userId;

      const tasks = await this.tasksService.getUserTasks(userId);

      return ResponseHelper.success(
        res,
        tasks,
        "User tasks retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };
}

export const tasksController = new TasksController();
export { TasksController };

// Export individual methods untuk routes
export const getTasks = tasksController.getTasks;
export const getTaskById = tasksController.getTaskById;
export const createTask = tasksController.createTask;
export const updateTask = tasksController.updateTask;
export const deleteTask = tasksController.deleteTask;
export const getTasksByWorkspace = tasksController.getTasksByWorkspace;
export const getMyTasks = tasksController.getMyTasks;
