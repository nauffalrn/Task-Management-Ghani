import { BaseService } from "../../common/service/base.service.js";
import { AttachmentsRepository } from "./attachments.repo.js";
import { TasksRepository } from "../tasks/tasks.repo.js";
import { AppError } from "../../common/utils/appError.js";
import path from "path";
import fs from "fs";

export class AttachmentsService extends BaseService {
  constructor() {
    super();
    this.attachmentsRepository = new AttachmentsRepository();
    this.tasksRepository = new TasksRepository();
  }

  // Upload attachment
  async uploadAttachment(attachmentData) {
    try {
      const { taskId, file, userId } = attachmentData;

      console.log("📝 AttachmentsService uploadAttachment - Data:", {
        taskId,
        filename: file.filename,
        userId,
      });

      // Validate task exists
      const task = await this.tasksRepository.findById(taskId);
      if (!task) {
        throw AppError.notFound("Task not found");
      }

      // PERBAIKAN: Gunakan field yang benar sesuai database
      const newAttachment = await this.attachmentsRepository.create({
        taskId,
        userId, // UBAH: dari uploadedBy ke userId
        filename: file.filename,
        originalName: file.originalname,
        filetype: file.mimetype, // UBAH: dari mimeType ke filetype
        fileSize: file.size,
        filePath: file.path,
      });

      console.log(
        "✅ AttachmentsService uploadAttachment - Created:",
        newAttachment.id
      );
      return newAttachment;
    } catch (error) {
      console.error("❌ AttachmentsService uploadAttachment error:", error);
      throw error;
    }
  }

  // Delete attachment
  async deleteAttachment(id, userId) {
    try {
      console.log("🗑️ AttachmentsService deleteAttachment - ID:", id);

      // Check if attachment exists
      const existingAttachment = await this.attachmentsRepository.findById(id);
      if (!existingAttachment) {
        throw AppError.notFound("Attachment not found");
      }

      // PERBAIKAN: Gunakan field yang benar
      if (existingAttachment.userId !== userId) {
        // UBAH: dari uploadedBy
        throw AppError.forbidden("You can only delete your own attachments");
      }

      // Delete file from filesystem
      try {
        if (fs.existsSync(existingAttachment.filePath)) {
          fs.unlinkSync(existingAttachment.filePath);
        }
      } catch (fileError) {
        console.warn(
          "⚠️ Could not delete file from filesystem:",
          fileError.message
        );
      }

      await this.attachmentsRepository.delete(id);

      console.log(
        "✅ AttachmentsService deleteAttachment - Deleted attachment:",
        existingAttachment.filename
      );
      return true;
    } catch (error) {
      console.error("❌ AttachmentsService deleteAttachment error:", error);
      throw error;
    }
  }

  // Get all attachments
  async getAllAttachments(options = {}) {
    try {
      const { page = 1, limit = 10, taskId } = options;

      console.log(
        "🔍 AttachmentsService getAllAttachments - Options:",
        options
      );

      const attachments = await this.attachmentsRepository.findMany({
        page,
        limit,
        taskId,
      });

      console.log(
        "✅ AttachmentsService getAllAttachments - Found:",
        attachments.length
      );
      return attachments;
    } catch (error) {
      console.error("❌ AttachmentsService getAllAttachments error:", error);
      throw error;
    }
  }

  // Get attachment by ID
  async getAttachmentById(id) {
    try {
      console.log("🔍 AttachmentsService getAttachmentById - ID:", id);

      const attachment = await this.attachmentsRepository.findById(id);
      if (!attachment) {
        throw AppError.notFound("Attachment not found");
      }

      console.log(
        "✅ AttachmentsService getAttachmentById - Found:",
        attachment.filename
      );
      return attachment;
    } catch (error) {
      console.error("❌ AttachmentsService getAttachmentById error:", error);
      throw error;
    }
  }

  // Get attachment for download
  async getAttachmentForDownload(id) {
    try {
      console.log("📥 AttachmentsService getAttachmentForDownload - ID:", id);

      const attachment = await this.attachmentsRepository.findById(id);
      if (!attachment) {
        throw AppError.notFound("Attachment not found");
      }

      // Check if file exists
      if (!fs.existsSync(attachment.filePath)) {
        throw AppError.notFound("File not found on server");
      }

      console.log(
        "✅ AttachmentsService getAttachmentForDownload - File ready:",
        attachment.filename
      );
      return {
        filePath: attachment.filePath,
        originalName: attachment.originalName,
      };
    } catch (error) {
      console.error(
        "❌ AttachmentsService getAttachmentForDownload error:",
        error
      );
      throw error;
    }
  }

  // Get attachments by task
  async getAttachmentsByTask(taskId) {
    try {
      console.log(
        "🔍 AttachmentsService getAttachmentsByTask - TaskId:",
        taskId
      );

      // Validate task exists
      const task = await this.tasksRepository.findById(taskId);
      if (!task) {
        throw AppError.notFound("Task not found");
      }

      const attachments = await this.attachmentsRepository.findByTaskId(taskId);

      console.log(
        "✅ AttachmentsService getAttachmentsByTask - Found:",
        attachments.length
      );
      return attachments;
    } catch (error) {
      console.error("❌ AttachmentsService getAttachmentsByTask error:", error);
      throw error;
    }
  }
}
