import { BaseController } from "../../common/controller/base.controller.js";
import { AttachmentsService } from "./attachments.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";
import fs from "fs";

export class AttachmentsController extends BaseController {
  constructor() {
    const attachmentsService = new AttachmentsService();
    super(attachmentsService, "Attachment");
  }

  async getTaskAttachments(req, res, next) {
    try {
      const { taskId } = req.params;
      const attachments = await this.service.getTaskAttachments(
        parseInt(taskId)
      );

      return ResponseHelper.success(
        res,
        attachments,
        "Task attachments retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async createAttachment(req, res, next) {
    try {
      const { taskId } = req.params;
      const file = req.file;
      const userId = req.user.userId;

      const attachment = await this.service.uploadFile(
        file,
        parseInt(taskId),
        userId
      );

      return ResponseHelper.created(
        res,
        attachment,
        "File uploaded successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteAttachment(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await this.service.deleteAttachment(parseInt(id), userId);

      return ResponseHelper.success(
        res,
        null,
        "Attachment deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async downloadAttachment(req, res, next) {
    try {
      const { id } = req.params;
      const attachment = await this.service.getById(parseInt(id));

      if (!attachment) {
        return ResponseHelper.notFound(res, "Attachment not found");
      }

      if (!fs.existsSync(attachment.filePath)) {
        return ResponseHelper.notFound(res, "File not found on server");
      }

      res.download(attachment.filePath, attachment.originalName);
    } catch (error) {
      next(error);
    }
  }
}

// Export individual functions for routes
const controller = new AttachmentsController();

export const getTaskAttachments = (req, res, next) =>
  controller.getTaskAttachments(req, res, next);

export const getAttachmentById = (req, res, next) =>
  controller.getById(req, res, next);

export const createAttachment = (req, res, next) =>
  controller.createAttachment(req, res, next);

export const deleteAttachment = (req, res, next) =>
  controller.deleteAttachment(req, res, next);

export const downloadAttachment = (req, res, next) =>
  controller.downloadAttachment(req, res, next);
