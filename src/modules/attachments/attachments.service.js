import { AttachmentsRepository } from "./attachments.repo.js";
import path from "path";
import fs from "fs";

export class AttachmentsService {
  constructor() {
    this.attachmentsRepo = new AttachmentsRepository();
  }

  async uploadFile(file, taskId, userId) {
    try {
      if (!file) {
        throw new Error("No file provided");
      }

      // Create attachment record
      const attachment = await this.attachmentsRepo.create({
        taskId,
        userId,
        fileName: file.filename,
        originalName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
      });

      return {
        success: true,
        message: "File uploaded successfully",
        data: {
          attachment: {
            ...attachment,
            downloadUrl: this.getDownloadUrl(file.path),
            previewUrl: this.getPreviewUrl(attachment),
          },
        },
      };
    } catch (error) {
      // Clean up file if database save fails
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error(error.message);
    }
  }

  // ADD: Missing getAttachmentById method
  async getAttachmentById(attachmentId) {
    try {
      const attachment = await this.attachmentsRepo.findById(attachmentId);

      if (!attachment) {
        throw new Error("Attachment not found");
      }

      const attachmentWithUrls = {
        ...attachment,
        downloadUrl: this.getDownloadUrl(attachment.filePath),
        previewUrl: this.getPreviewUrl(attachment),
        isImage: attachment.fileType.startsWith("image/"),
        formattedSize: this.formatFileSize(attachment.fileSize),
      };

      return {
        success: true,
        message: "Attachment retrieved successfully",
        data: { attachment: attachmentWithUrls },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getTaskAttachments(taskId) {
    try {
      const attachments = await this.attachmentsRepo.findByTaskId(taskId);

      const attachmentsWithUrls = attachments.map((attachment) => ({
        ...attachment,
        downloadUrl: this.getDownloadUrl(attachment.filePath),
        previewUrl: this.getPreviewUrl(attachment),
        isImage: attachment.fileType.startsWith("image/"),
        formattedSize: this.formatFileSize(attachment.fileSize),
      }));

      return {
        success: true,
        message: "Attachments retrieved successfully",
        data: { attachments: attachmentsWithUrls },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteAttachment(attachmentId, userId) {
    try {
      const attachment = await this.attachmentsRepo.findById(attachmentId);

      if (!attachment) {
        throw new Error("Attachment not found");
      }

      // Check if user owns the attachment or has permission
      if (attachment.userId !== userId) {
        throw new Error("Access denied");
      }

      // Delete file from filesystem
      if (fs.existsSync(attachment.filePath)) {
        fs.unlinkSync(attachment.filePath);
      }

      // Delete from database
      await this.attachmentsRepo.delete(attachmentId);

      return {
        success: true,
        message: "Attachment deleted successfully",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Helper methods
  getDownloadUrl(filePath) {
    // Convert file path to URL path
    return filePath.replace("public", "");
  }

  getPreviewUrl(attachment) {
    if (attachment.fileType && attachment.fileType.startsWith("image/")) {
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
