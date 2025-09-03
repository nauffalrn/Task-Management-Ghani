import { BaseController } from "../../common/controller/base.controller.js";
import { CommentsService } from "./comments.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";
import { PAGINATION } from "../../common/constants/app.js";

export class CommentsController extends BaseController {
  constructor() {
    const commentsService = new CommentsService();
    super(commentsService, "Comment");
  }

  async create(req, res, next) {
    try {
      const commentData = {
        ...req.body,
        userId: req.user.userId,
      };

      const result = await this.service.create(commentData);
      return ResponseHelper.created(
        res,
        result,
        "Comment created successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async getByTask(req, res, next) {
    try {
      const { taskId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(
        parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
        PAGINATION.MAX_LIMIT
      );
      const offset = (page - 1) * limit;

      const result = await this.service.getCommentsByTask(taskId, {
        limit,
        offset,
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
        "Task comments retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}
