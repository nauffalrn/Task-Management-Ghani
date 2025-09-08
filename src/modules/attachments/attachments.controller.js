import { BaseController } from "../../common/controller/base.controller.js";
import { AttachmentsService } from "./attachments.service.js";

class AttachmentsController extends BaseController {
  constructor() {
    super();
    this.attachmentsService = new AttachmentsService();
  }

  getTaskAttachments = async (req, res) => {
    try {
      const { taskId } = req.params;

      const attachments = await this.attachmentsService.getTaskAttachments(
        taskId,
        {
          requesterId: req.user.id,
          requesterRole: req.user.role,
        }
      );

      return this.sendSuccessResponse(
        res,
        "Task attachments retrieved successfully",
        attachments
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  getAttachmentById = async (req, res) => {
    try {
      const { id } = req.params;

      const attachment = await this.attachmentsService.getAttachmentById(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Attachment retrieved successfully",
        attachment
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  uploadAttachment = async (req, res) => {
    try {
      const { taskId } = req.params;
      const file = req.file;

      if (!file) {
        return this.sendErrorResponse(res, "No file uploaded", 400);
      }

      const attachment = await this.attachmentsService.uploadAttachment(
        taskId,
        file,
        {
          requesterId: req.user.id,
          requesterRole: req.user.role,
        }
      );

      return this.sendSuccessResponse(
        res,
        "File uploaded successfully",
        attachment,
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

  downloadAttachment = async (req, res) => {
    try {
      const { id } = req.params;

      const fileInfo = await this.attachmentsService.downloadAttachment(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      res.download(fileInfo.path, fileInfo.originalName);
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  deleteAttachment = async (req, res) => {
    try {
      const { id } = req.params;

      await this.attachmentsService.deleteAttachment(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(res, "Attachment deleted successfully");
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };
}

const attachmentsController = new AttachmentsController();

export const {
  getTaskAttachments,
  getAttachmentById,
  uploadAttachment,
  downloadAttachment,
  deleteAttachment,
} = attachmentsController;
