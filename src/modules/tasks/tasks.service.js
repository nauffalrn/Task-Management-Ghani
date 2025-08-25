import { TasksRepository } from "./tasks.repo.js";
import { WorkspacesRepository } from "../workspaces/workspaces.repo.js";
import { UsersRepository } from "../users/users.repo.js";
import {
  GLOBAL_ACCESS_ROLES,
  WORKSPACE_CREATOR_ROLES,
} from "../../common/constants/roles.js";

export class TasksService {
  constructor() {
    this.tasksRepo = new TasksRepository();
    this.workspacesRepo = new WorkspacesRepository();
    this.usersRepo = new UsersRepository();
  }

  async getAllTasks(user, filters = {}) {
    try {
      let tasksList;

      // If user has global access, get all tasks or filter by workspace
      if (GLOBAL_ACCESS_ROLES.includes(user.role)) {
        tasksList = await this.tasksRepo.findAll(filters);
      } else {
        // Get tasks from user's workspaces only
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const workspaceIds = userWorkspaces.map((ws) => ws.id);

        if (workspaceIds.length === 0) {
          tasksList = [];
        } else {
          // If workspace filter is provided, check if user has access
          if (
            filters.workspaceId &&
            !workspaceIds.includes(filters.workspaceId)
          ) {
            throw new Error("Access denied to this workspace");
          }

          tasksList = await this.tasksRepo.findAll(filters);
          // Filter tasks by user's accessible workspaces
          tasksList = tasksList.filter((task) =>
            workspaceIds.includes(task.workspaceId)
          );
        }
      }

      return {
        success: true,
        message: "Tasks retrieved successfully",
        data: { tasks: tasksList },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getTaskById(id, user) {
    try {
      const task = await this.tasksRepo.findById(id);

      if (!task) {
        throw new Error("Task not found");
      }

      // Check if user has access to this task's workspace
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const hasAccess = userWorkspaces.some(
          (ws) => ws.id === task.workspaceId
        );

        if (!hasAccess) {
          throw new Error("Access denied to this task");
        }
      }

      return {
        success: true,
        message: "Task retrieved successfully",
        data: { task },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getMyTasks(user) {
    try {
      const myTasks = await this.tasksRepo.findByAssignee(user.id);

      return {
        success: true,
        message: "My tasks retrieved successfully",
        data: { tasks: myTasks },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createTask(taskData, user) {
    try {
      const { workspaceId, title, description, assignTo, dueDate } = taskData;

      // Validate required fields
      if (!workspaceId || !title) {
        throw new Error("Workspace ID and title are required");
      }

      // Check if workspace exists
      const workspace = await this.workspacesRepo.findById(workspaceId);
      if (!workspace) {
        throw new Error("Workspace not found");
      }

      // Check if user has access to create tasks in this workspace
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const hasAccess = userWorkspaces.some((ws) => ws.id === workspaceId);

        if (!hasAccess) {
          throw new Error("Access denied to this workspace");
        }
      }

      // If assigning to someone, check if assignee exists
      if (assignTo) {
        const assignee = await this.usersRepo.findById(assignTo);
        if (!assignee) {
          throw new Error("Assignee not found");
        }
      }

      const newTask = await this.tasksRepo.create({
        workspaceId,
        title,
        description: description || null,
        assignTo: assignTo || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "todo",
      });

      return {
        success: true,
        message: "Task created successfully",
        data: { task: newTask },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateTask(id, taskData, user) {
    try {
      const task = await this.tasksRepo.findById(id);
      if (!task) {
        throw new Error("Task not found");
      }

      // Check if user has access to update this task
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const hasAccess = userWorkspaces.some(
          (ws) => ws.id === task.workspaceId
        );

        if (!hasAccess) {
          throw new Error("Access denied to this task");
        }
      }

      // If assigning to someone, check if assignee exists
      if (taskData.assignTo !== undefined && taskData.assignTo !== null) {
        const assignee = await this.usersRepo.findById(taskData.assignTo);
        if (!assignee) {
          throw new Error("Assignee not found");
        }
      }

      // Prepare update data
      const updateData = { ...taskData };
      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate);
      }

      const updatedTask = await this.tasksRepo.update(id, updateData);

      return {
        success: true,
        message: "Task updated successfully",
        data: { task: updatedTask },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteTask(id, user) {
    try {
      const task = await this.tasksRepo.findById(id);
      if (!task) {
        throw new Error("Task not found");
      }

      // Check if user has access to delete this task
      if (
        !GLOBAL_ACCESS_ROLES.includes(user.role) &&
        !WORKSPACE_CREATOR_ROLES.includes(user.role)
      ) {
        throw new Error("Access denied. You cannot delete tasks");
      }

      // Check workspace access
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const hasAccess = userWorkspaces.some(
          (ws) => ws.id === task.workspaceId
        );

        if (!hasAccess) {
          throw new Error("Access denied to this task");
        }
      }

      await this.tasksRepo.delete(id);

      return {
        success: true,
        message: "Task deleted successfully",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
