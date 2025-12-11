import { BaseController } from "../../common/controller/base.controller.js";
import { CommentsService } from "./comments.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";

class CommentsController extends BaseController {
  constructor() {
    super();
    this.commentsService = new CommentsService();
  }

  // GET /api/comments - List all comments
  getComments = async (req, res, next) => {
    try {
      const { page = 1, limit = 10, taskId } = req.query;

      const comments = await this.commentsService.getAllComments({
        page: parseInt(page),
        limit: parseInt(limit),
        taskId: taskId ? parseInt(taskId) : undefined,
      });

      return ResponseHelper.success(
        res,
        comments,
        "Comments retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/comments/:id - Get comment by ID
  getCommentById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const comment = await this.commentsService.getCommentById(id);

      return ResponseHelper.success(
        res,
        comment,
        "Comment retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // POST /api/comments - Create comment
  createComment = async (req, res, next) => {
    try {
      const commentData = req.body;
      const userId = req.user.userId;

      const comment = await this.commentsService.createComment(
        commentData,
        userId
      );

      return ResponseHelper.created(
        res,
        comment,
        "Comment created successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/comments/:id - Update comment
  updateComment = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;

      const comment = await this.commentsService.updateComment(
        id,
        updateData,
        userId
      );

      return ResponseHelper.success(
        res,
        comment,
        "Comment updated successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/comments/:id - Delete comment
  deleteComment = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await this.commentsService.deleteComment(id, userId);

      return ResponseHelper.success(res, null, "Comment deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  // GET /api/comments/task/:taskId - Get comments by task
  getCommentsByTask = async (req, res, next) => {
    try {
      const { taskId } = req.params;

      const comments = await this.commentsService.getCommentsByTask(taskId);

      return ResponseHelper.success(
        res,
        comments,
        "Task comments retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };
}

export const commentsController = new CommentsController();
export { CommentsController };

// Export individual methods untuk routes
export const getComments = commentsController.getComments;
export const getCommentById = commentsController.getCommentById;
export const createComment = commentsController.createComment;
export const updateComment = commentsController.updateComment;
export const deleteComment = commentsController.deleteComment;
export const getCommentsByTask = commentsController.getCommentsByTask;
