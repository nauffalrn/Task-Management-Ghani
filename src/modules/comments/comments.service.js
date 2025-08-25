import { CommentsRepository } from "./comments.repo.js";
import { TasksRepository } from "../tasks/tasks.repo.js";
import { WorkspacesRepository } from "../workspaces/workspaces.repo.js";
import { GLOBAL_ACCESS_ROLES } from "../../common/constants/roles.js";

export class CommentsService {
  constructor() {
    this.commentsRepo = new CommentsRepository();
    this.tasksRepo = new TasksRepository();
    this.workspacesRepo = new WorkspacesRepository();
  }

  async getTaskComments(taskId, user) {
    try {
      // Check if task exists
      const task = await this.tasksRepo.findById(taskId);
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

      const commentsList = await this.commentsRepo.findByTaskId(taskId);

      return {
        success: true,
        message: "Comments retrieved successfully",
        data: { comments: commentsList },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createComment(commentData, user) {
    try {
      const { taskId, content } = commentData;

      // Validate required fields
      if (!taskId || !content) {
        throw new Error("Task ID and content are required");
      }

      // Check if task exists
      const task = await this.tasksRepo.findById(taskId);
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

      const newComment = await this.commentsRepo.create({
        taskId,
        userId: user.id,
        content,
      });

      return {
        success: true,
        message: "Comment created successfully",
        data: { comment: newComment },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateComment(id, commentData, user) {
    try {
      const comment = await this.commentsRepo.findById(id);
      if (!comment) {
        throw new Error("Comment not found");
      }

      // Check if user owns the comment or has global access
      if (
        comment.userId !== user.id &&
        !GLOBAL_ACCESS_ROLES.includes(user.role)
      ) {
        throw new Error("Access denied. You can only edit your own comments");
      }

      const updatedComment = await this.commentsRepo.update(id, commentData);

      return {
        success: true,
        message: "Comment updated successfully",
        data: { comment: updatedComment },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteComment(id, user) {
    try {
      const comment = await this.commentsRepo.findById(id);
      if (!comment) {
        throw new Error("Comment not found");
      }

      // Check if user owns the comment or has global access
      if (
        comment.userId !== user.id &&
        !GLOBAL_ACCESS_ROLES.includes(user.role)
      ) {
        throw new Error("Access denied. You can only delete your own comments");
      }

      await this.commentsRepo.delete(id);

      return {
        success: true,
        message: "Comment deleted successfully",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
