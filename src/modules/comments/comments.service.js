import { BaseService } from "../../common/service/base.service.js";
import { CommentsRepository } from "./comments.repo.js";
import { HTTP_STATUS } from "../../common/constants/app.js";

export class CommentsService extends BaseService {
  constructor() {
    const commentsRepo = new CommentsRepository();
    super(commentsRepo, "Comment");
  }

  async getCommentsByTask(taskId, options = {}) {
    if (!taskId) {
      throw new Error("Task ID is required");
    }
    return await this.repository.findByTaskId(taskId, options);
  }

  async create(commentData) {
    try {
      if (!commentData.content || !commentData.taskId || !commentData.userId) {
        const error = new Error("Content, task ID, and user ID are required");
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      return await this.repository.create(commentData);
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to create comment: ${error.message}`);
    }
  }

  async getCommentWithUser(commentId) {
    if (!commentId) {
      throw new Error("Comment ID is required");
    }
    return await this.repository.findWithUser(commentId);
  }
}
