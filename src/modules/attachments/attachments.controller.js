import { BaseController } from "../../common/controller/base.controller.js";
import { AttachmentsService } from "./attachments.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";

class AttachmentsController extends BaseController {
  constructor() {
    super();
    this.attachmentsService = new AttachmentsService();
  }

  // GET /api/attachments - List all attachments
  getAttachments = async (req, res, next) => {
    try {
      const { page = 1, limit = 10, taskId } = req.query;

      const attachments = await this.attachmentsService.getAllAttachments({
        page: parseInt(page),
        limit: parseInt(limit),
        taskId: taskId ? parseInt(taskId) : undefined,
      });

      return ResponseHelper.success(
        res,
        attachments,
        "Attachments retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/attachments/:id - Get attachment by ID
  getAttachmentById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const attachment = await this.attachmentsService.getAttachmentById(id);

      return ResponseHelper.success(
        res,
        attachment,
        "Attachment retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // POST /api/attachments - Upload attachment
  uploadAttachment = async (req, res, next) => {
    try {
      const { taskId } = req.body;
      const file = req.file;
      const userId = req.user.userId;

      if (!file) {
        return ResponseHelper.badRequest(res, "File is required");
      }

      const attachment = await this.attachmentsService.uploadAttachment({
        taskId: parseInt(taskId),
        file,
        userId,
      });

      return ResponseHelper.created(
        res,
        attachment,
        "Attachment uploaded successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/attachments/:id - Delete attachment
  deleteAttachment = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await this.attachmentsService.deleteAttachment(id, userId);

      return ResponseHelper.success(
        res,
        null,
        "Attachment deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/attachments/download/:id - Download attachment
  downloadAttachment = async (req, res, next) => {
    try {
      const { id } = req.params;

      const { filePath, originalName } =
        await this.attachmentsService.getAttachmentForDownload(id);

      res.download(filePath, originalName);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/attachments/task/:taskId - Get attachments by task
  getAttachmentsByTask = async (req, res, next) => {
    try {
      const { taskId } = req.params;

      const attachments = await this.attachmentsService.getAttachmentsByTask(
        taskId
      );

      return ResponseHelper.success(
        res,
        attachments,
        "Task attachments retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };
}

export const attachmentsController = new AttachmentsController();
export { AttachmentsController };

// Export individual methods untuk routes
export const getAttachments = attachmentsController.getAttachments;
export const getAttachmentById = attachmentsController.getAttachmentById;
export const uploadAttachment = attachmentsController.uploadAttachment;
export const deleteAttachment = attachmentsController.deleteAttachment;
export const downloadAttachment = attachmentsController.downloadAttachment;
export const getAttachmentsByTask = attachmentsController.getAttachmentsByTask;
