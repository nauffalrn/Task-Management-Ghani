import { BaseController } from "../../common/controller/base.controller.js";
import { CommentsService } from "./comments.service.js";

class CommentsController extends BaseController {
  constructor() {
    super();
    this.commentsService = new CommentsService();
  }

  getTaskComments = async (req, res) => {
    try {
      const { taskId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.commentsService.getTaskComments(taskId, {
        page: parseInt(page),
        limit: parseInt(limit),
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Task comments retrieved successfully",
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

  getCommentById = async (req, res) => {
    try {
      const { id } = req.params;

      const comment = await this.commentsService.getCommentById(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Comment retrieved successfully",
        comment
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  createComment = async (req, res) => {
    try {
      const { taskId } = req.params;
      const commentData = { ...req.body, taskId: parseInt(taskId) };

      const comment = await this.commentsService.createComment(commentData, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Comment created successfully",
        comment,
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

  updateComment = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const comment = await this.commentsService.updateComment(id, updateData, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Comment updated successfully",
        comment
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  deleteComment = async (req, res) => {
    try {
      const { id } = req.params;

      await this.commentsService.deleteComment(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(res, "Comment deleted successfully");
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };
}

const commentsController = new CommentsController();

export const {
  getTaskComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
} = commentsController;
