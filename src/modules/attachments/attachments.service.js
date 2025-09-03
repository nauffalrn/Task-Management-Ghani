import { BaseService } from "../../common/service/base.service.js";
import { AttachmentsRepository } from "./attachments.repo.js";
import { HTTP_STATUS, PAGINATION } from "../../common/constants/app.js";
import { ilike } from "drizzle-orm";
import path from "path";
import fs from "fs";

export class AttachmentsService extends BaseService {
  constructor() {
    const attachmentsRepo = new AttachmentsRepository();
    super(attachmentsRepo, "Attachment");
  }

  async uploadFile(file, taskId, userId) {
    try {
      if (!file) {
        const error = new Error("No file provided");
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      if (!taskId || !userId) {
        const error = new Error("Task ID and User ID are required");
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      // Create attachment record
      const attachment = await this.repository.create({
        taskId,
        userId,
        fileName: file.filename,
        originalName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
      });

      return {
        ...attachment,
        downloadUrl: this.getDownloadUrl(file.path),
        previewUrl: this.getPreviewUrl(attachment),
        formattedSize: this.formatFileSize(file.size),
        isImage: file.mimetype.startsWith("image/"),
      };
    } catch (error) {
      // Clean up file if database save fails
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      if (error.statusCode) throw error;
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async getTaskAttachments(taskId) {
    try {
      if (!taskId) {
        const error = new Error("Task ID is required");
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      const attachments = await this.repository.findByTaskId(taskId);

      const attachmentsWithUrls = attachments.map((attachment) => ({
        ...attachment,
        downloadUrl: this.getDownloadUrl(attachment.filePath),
        previewUrl: this.getPreviewUrl(attachment),
        isImage: attachment.fileType.startsWith("image/"),
        formattedSize: this.formatFileSize(attachment.fileSize),
      }));

      return attachmentsWithUrls;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to get task attachments: ${error.message}`);
    }
  }

  async deleteAttachment(attachmentId, userId) {
    try {
      const attachment = await this.repository.findById(attachmentId);

      if (!attachment) {
        const error = new Error("Attachment not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Check if user owns the attachment or has permission
      if (attachment.userId !== userId) {
        const error = new Error("Access denied");
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      // Delete file from filesystem
      if (fs.existsSync(attachment.filePath)) {
        fs.unlinkSync(attachment.filePath);
      }

      // Delete from database
      await this.repository.delete(attachmentId);

      return attachment;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to delete attachment: ${error.message}`);
    }
  }

  // Helper methods
  getDownloadUrl(filePath) {
    return filePath.replace("public", "");
  }

  getPreviewUrl(attachment) {
    if (attachment.fileType.startsWith("image/")) {
      return this.getDownloadUrl(attachment.filePath);
    }
    return null;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
