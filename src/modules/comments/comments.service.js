import { BaseService } from "../../common/service/base.service.js";
import { CommentsRepository } from "./comments.repo.js";
import { TasksRepository } from "../tasks/tasks.repo.js";
import { AppError } from "../../common/utils/appError.js";

export class CommentsService extends BaseService {
  constructor() {
    super();
    this.commentsRepository = new CommentsRepository();
    this.tasksRepository = new TasksRepository();
  }

  // Get all comments
  async getAllComments(options = {}) {
    try {
      const { page = 1, limit = 10, taskId } = options;

      console.log("🔍 CommentsService getAllComments - Options:", options);

      const comments = await this.commentsRepository.findMany({
        page,
        limit,
        taskId,
      });

      console.log(
        "✅ CommentsService getAllComments - Found:",
        comments.length
      );
      return comments;
    } catch (error) {
      console.error("❌ CommentsService getAllComments error:", error);
      throw error;
    }
  }

  // Get comment by ID
  async getCommentById(id) {
    try {
      console.log("🔍 CommentsService getCommentById - ID:", id);

      const comment = await this.commentsRepository.findById(id);
      if (!comment) {
        throw AppError.notFound("Comment not found");
      }

      console.log("✅ CommentsService getCommentById - Found:", comment.id);
      return comment;
    } catch (error) {
      console.error("❌ CommentsService getCommentById error:", error);
      throw error;
    }
  }

  // Create comment
  async createComment(commentData, userId) {
    try {
      const { taskId, content } = commentData;

      console.log("📝 CommentsService createComment - Data:", {
        taskId,
        content,
        userId,
      });

      // Validate task exists
      const task = await this.tasksRepository.findById(taskId);
      if (!task) {
        throw AppError.notFound("Task not found");
      }

      // Create comment
      const newComment = await this.commentsRepository.create({
        taskId,
        userId,
        content,
      });

      console.log("✅ CommentsService createComment - Created:", newComment.id);
      return newComment;
    } catch (error) {
      console.error("❌ CommentsService createComment error:", error);
      throw error;
    }
  }

  // Update comment
  async updateComment(id, updateData, userId) {
    try {
      console.log(
        "🔄 CommentsService updateComment - ID:",
        id,
        "Data:",
        updateData
      );

      // Check if comment exists
      const existingComment = await this.commentsRepository.findById(id);
      if (!existingComment) {
        throw AppError.notFound("Comment not found");
      }

      // Check if user is owner of comment
      if (existingComment.userId !== userId) {
        throw AppError.forbidden("You can only update your own comments");
      }

      const updatedComment = await this.commentsRepository.update(
        id,
        updateData
      );

      console.log(
        "✅ CommentsService updateComment - Updated:",
        updatedComment.id
      );
      return updatedComment;
    } catch (error) {
      console.error("❌ CommentsService updateComment error:", error);
      throw error;
    }
  }

  // Delete comment
  async deleteComment(id, userId) {
    try {
      console.log("🗑️ CommentsService deleteComment - ID:", id);

      // Check if comment exists
      const existingComment = await this.commentsRepository.findById(id);
      if (!existingComment) {
        throw AppError.notFound("Comment not found");
      }

      // Check if user is owner of comment
      if (existingComment.userId !== userId) {
        throw AppError.forbidden("You can only delete your own comments");
      }

      await this.commentsRepository.delete(id);

      console.log(
        "✅ CommentsService deleteComment - Deleted comment:",
        existingComment.id
      );
      return true;
    } catch (error) {
      console.error("❌ CommentsService deleteComment error:", error);
      throw error;
    }
  }

  // Get comments by task
  async getCommentsByTask(taskId) {
    try {
      console.log("🔍 CommentsService getCommentsByTask - TaskId:", taskId);

      // Validate task exists
      const task = await this.tasksRepository.findById(taskId);
      if (!task) {
        throw AppError.notFound("Task not found");
      }

      const comments = await this.commentsRepository.findByTaskId(taskId);

      console.log(
        "✅ CommentsService getCommentsByTask - Found:",
        comments.length
      );
      return comments;
    } catch (error) {
      console.error("❌ CommentsService getCommentsByTask error:", error);
      throw error;
    }
  }
}
