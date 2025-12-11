import { BaseService } from "../../common/service/base.service.js";
import { TasksRepository } from "./tasks.repo.js";
import { WorkspacesRepository } from "../workspaces/workspaces.repo.js";
import { UsersRepository } from "../users/users.repo.js";
import { AppError } from "../../common/utils/appError.js";

export class TasksService extends BaseService {
  constructor() {
    super();
    this.tasksRepository = new TasksRepository();
    this.workspacesRepository = new WorkspacesRepository();
    this.usersRepository = new UsersRepository();
  }

  // Get all tasks
  async getAllTasks(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        workspaceId,
        status,
        assignedTo,
      } = options;

      console.log("🔍 TasksService getAllTasks - Options:", options);

      const tasks = await this.tasksRepository.findMany({
        page,
        limit,
        search,
        workspaceId,
        status,
        assignedTo,
      });

      console.log("✅ TasksService getAllTasks - Found:", tasks.length);
      return tasks;
    } catch (error) {
      console.error("❌ TasksService getAllTasks error:", error);
      throw error;
    }
  }

  // Get task by ID
  async getTaskById(id) {
    try {
      console.log("🔍 TasksService getTaskById - ID:", id);

      const task = await this.tasksRepository.findById(id);
      if (!task) {
        throw AppError.notFound("Task not found");
      }

      console.log("✅ TasksService getTaskById - Found:", task.title);
      return task;
    } catch (error) {
      console.error("❌ TasksService getTaskById error:", error);
      throw error;
    }
  }

  // Create task
  async createTask(taskData, userId) {
    try {
      const {
        workspaceId,
        title,
        description,
        assignedTo,
        dueDate,
        status = "todo",
      } = taskData;

      console.log("📝 TasksService createTask - Data:", {
        workspaceId,
        title,
        assignedTo,
        userId,
      });

      // Validate workspace exists
      const workspace = await this.workspacesRepository.findById(workspaceId);
      if (!workspace) {
        throw AppError.notFound("Workspace not found");
      }

      // Validate assigned user exists (if provided)
      if (assignedTo) {
        const assignedUser = await this.usersRepository.findById(assignedTo);
        if (!assignedUser) {
          throw AppError.notFound("Assigned user not found");
        }
      }

      // Create task
      const newTask = await this.tasksRepository.create({
        workspaceId,
        title,
        description,
        status,
        assignedTo,
        createdBy: userId,
        dueDate: dueDate ? new Date(dueDate) : null,
      });

      console.log("✅ TasksService createTask - Created:", newTask.id);
      return newTask;
    } catch (error) {
      console.error("❌ TasksService createTask error:", error);
      throw error;
    }
  }

  // Update task
  async updateTask(id, updateData, userId) {
    try {
      console.log("🔄 TasksService updateTask - ID:", id, "Data:", updateData);

      // Check if task exists
      const existingTask = await this.tasksRepository.findById(id);
      if (!existingTask) {
        throw AppError.notFound("Task not found");
      }

      // Validate assigned user exists (if being updated)
      if (updateData.assignedTo) {
        const assignedUser = await this.usersRepository.findById(
          updateData.assignedTo
        );
        if (!assignedUser) {
          throw AppError.notFound("Assigned user not found");
        }
      }

      // Parse due date if provided
      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate);
      }

      const updatedTask = await this.tasksRepository.update(id, updateData);

      console.log("✅ TasksService updateTask - Updated:", updatedTask.title);
      return updatedTask;
    } catch (error) {
      console.error("❌ TasksService updateTask error:", error);
      throw error;
    }
  }

  // Delete task
  async deleteTask(id, userId) {
    try {
      console.log("🗑️ TasksService deleteTask - ID:", id);

      // Check if task exists
      const existingTask = await this.tasksRepository.findById(id);
      if (!existingTask) {
        throw AppError.notFound("Task not found");
      }

      await this.tasksRepository.delete(id);

      console.log(
        "✅ TasksService deleteTask - Deleted task:",
        existingTask.title
      );
      return true;
    } catch (error) {
      console.error("❌ TasksService deleteTask error:", error);
      throw error;
    }
  }

  // Get tasks by workspace
  async getTasksByWorkspace(workspaceId) {
    try {
      console.log(
        "🔍 TasksService getTasksByWorkspace - WorkspaceId:",
        workspaceId
      );

      // Validate workspace exists
      const workspace = await this.workspacesRepository.findById(workspaceId);
      if (!workspace) {
        throw AppError.notFound("Workspace not found");
      }

      const tasks = await this.tasksRepository.findByWorkspaceId(workspaceId);

      console.log("✅ TasksService getTasksByWorkspace - Found:", tasks.length);
      return tasks;
    } catch (error) {
      console.error("❌ TasksService getTasksByWorkspace error:", error);
      throw error;
    }
  }

  // Get user's assigned tasks
  async getUserTasks(userId) {
    try {
      console.log("🔍 TasksService getUserTasks - UserId:", userId);

      const tasks = await this.tasksRepository.findByAssignedTo(userId);

      console.log("✅ TasksService getUserTasks - Found:", tasks.length);
      return tasks;
    } catch (error) {
      console.error("❌ TasksService getUserTasks error:", error);
      throw error;
    }
  }
}
