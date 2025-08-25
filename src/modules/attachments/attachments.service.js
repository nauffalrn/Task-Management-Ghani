import { AttachmentsRepository } from "./attachments.repo.js";
import { TasksRepository } from "../tasks/tasks.repo.js";
import { WorkspacesRepository } from "../workspaces/workspaces.repo.js";
import { GLOBAL_ACCESS_ROLES } from "../../common/constants/roles.js";

export class AttachmentsService {
  constructor() {
    this.attachmentsRepo = new AttachmentsRepository();
    this.tasksRepo = new TasksRepository();
    this.workspacesRepo = new WorkspacesRepository();
  }

  async getTaskAttachments(taskId, user) {
    try {
      // Check if task exists
      const task = await this.tasksRepo.findById(taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      // Check if user has access to this task's workspace
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const hasAccess = userWorkspaces.some(
          (ws) => ws.id === task.workspaceId
        );

        if (!hasAccess) {
          throw new Error("Access denied to this task");
        }
      }

      const attachmentsList = await this.attachmentsRepo.findByTaskId(taskId);

      return {
        success: true,
        message: "Attachments retrieved successfully",
        data: { attachments: attachmentsList },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createAttachment(attachmentData, user) {
    try {
      const { taskId, fileName, fileType, cloudinaryUrl } = attachmentData;

      // Validate required fields
      if (!taskId || !fileName || !fileType || !cloudinaryUrl) {
        throw new Error(
          "Task ID, file name, file type, and cloudinary URL are required"
        );
      }

      // Check if task exists
      const task = await this.tasksRepo.findById(taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      // Check if user has access to this task's workspace
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const hasAccess = userWorkspaces.some(
          (ws) => ws.id === task.workspaceId
        );

        if (!hasAccess) {
          throw new Error("Access denied to this task");
        }
      }

      const newAttachment = await this.attachmentsRepo.create({
        taskId,
        userId: user.id,
        fileName,
        fileType,
        cloudinaryUrl,
      });

      return {
        success: true,
        message: "Attachment uploaded successfully",
        data: { attachment: newAttachment },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteAttachment(id, user) {
    try {
      const attachment = await this.attachmentsRepo.findById(id);
      if (!attachment) {
        throw new Error("Attachment not found");
      }

      // Check if user owns the attachment or has global access
      if (
        attachment.userId !== user.id &&
        !GLOBAL_ACCESS_ROLES.includes(user.role)
      ) {
        throw new Error(
          "Access denied. You can only delete your own attachments"
        );
      }

      await this.attachmentsRepo.delete(id);

      return {
        success: true,
        message: "Attachment deleted successfully",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAttachmentById(id, user) {
    try {
      const attachment = await this.attachmentsRepo.findById(id);
      if (!attachment) {
        throw new Error("Attachment not found");
      }

      // Check if task exists and user has access
      const task = await this.tasksRepo.findById(attachment.taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      // Check if user has access to this task's workspace
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const hasAccess = userWorkspaces.some(
          (ws) => ws.id === task.workspaceId
        );

        if (!hasAccess) {
          throw new Error("Access denied to this attachment");
        }
      }

      return {
        success: true,
        message: "Attachment retrieved successfully",
        data: { attachment },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
