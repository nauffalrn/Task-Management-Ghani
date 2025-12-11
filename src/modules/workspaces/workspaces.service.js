import { BaseService } from "../../common/service/base.service.js";
import { WorkspacesRepository } from "./workspaces.repo.js";
import { AppError } from "../../common/utils/appError.js";

export class WorkspacesService extends BaseService {
  constructor() {
    super();
    this.workspacesRepository = new WorkspacesRepository();
  }

  // Get all workspaces
  async getAllWorkspaces(options = {}) {
    try {
      const { page = 1, limit = 10, search, userId } = options;

      console.log("🔍 WorkspacesService getAllWorkspaces - Options:", options);

      const workspaces = await this.workspacesRepository.findMany({
        page,
        limit,
        search,
        userId,
      });

      console.log(
        "✅ WorkspacesService getAllWorkspaces - Found:",
        workspaces.length
      );
      return workspaces;
    } catch (error) {
      console.error("❌ WorkspacesService getAllWorkspaces error:", error);
      throw error;
    }
  }

  // Get workspace by ID
  async getWorkspaceById(id) {
    try {
      console.log("🔍 WorkspacesService getWorkspaceById - ID:", id);

      const workspace = await this.workspacesRepository.findById(id);
      if (!workspace) {
        throw AppError.notFound("Workspace not found");
      }

      console.log(
        "✅ WorkspacesService getWorkspaceById - Found:",
        workspace.name
      );
      return workspace;
    } catch (error) {
      console.error("❌ WorkspacesService getWorkspaceById error:", error);
      throw error;
    }
  }

  // Create workspace
  async createWorkspace(workspaceData, userId) {
    try {
      const { name, description } = workspaceData;

      console.log("📝 WorkspacesService createWorkspace - Data:", {
        name,
        description,
        userId,
      });

      // Create workspace
      const newWorkspace = await this.workspacesRepository.create({
        name,
        description,
        createdBy: userId,
      });

      console.log(
        "✅ WorkspacesService createWorkspace - Created:",
        newWorkspace.id
      );
      return newWorkspace;
    } catch (error) {
      console.error("❌ WorkspacesService createWorkspace error:", error);
      throw error;
    }
  }

  // Update workspace
  async updateWorkspace(id, updateData, userId) {
    try {
      console.log(
        "🔄 WorkspacesService updateWorkspace - ID:",
        id,
        "Data:",
        updateData
      );

      // Check if workspace exists
      const existingWorkspace = await this.workspacesRepository.findById(id);
      if (!existingWorkspace) {
        throw AppError.notFound("Workspace not found");
      }

      // Check if user is owner (for authorization)
      if (existingWorkspace.createdBy !== userId) {
        throw AppError.forbidden(
          "Only workspace owner can update this workspace"
        );
      }

      const updatedWorkspace = await this.workspacesRepository.update(
        id,
        updateData
      );

      console.log(
        "✅ WorkspacesService updateWorkspace - Updated:",
        updatedWorkspace.name
      );
      return updatedWorkspace;
    } catch (error) {
      console.error("❌ WorkspacesService updateWorkspace error:", error);
      throw error;
    }
  }

  // Delete workspace
  async deleteWorkspace(id, userId) {
    try {
      console.log("🗑️ WorkspacesService deleteWorkspace - ID:", id);

      // Check if workspace exists
      const existingWorkspace = await this.workspacesRepository.findById(id);
      if (!existingWorkspace) {
        throw AppError.notFound("Workspace not found");
      }

      // Check if user is owner (for authorization)
      if (existingWorkspace.createdBy !== userId) {
        throw AppError.forbidden(
          "Only workspace owner can delete this workspace"
        );
      }

      await this.workspacesRepository.delete(id);

      console.log(
        "✅ WorkspacesService deleteWorkspace - Deleted workspace:",
        existingWorkspace.name
      );
      return true;
    } catch (error) {
      console.error("❌ WorkspacesService deleteWorkspace error:", error);
      throw error;
    }
  }

  // Get user's workspaces
  async getUserWorkspaces(userId) {
    try {
      console.log("🔍 WorkspacesService getUserWorkspaces - UserId:", userId);

      const workspaces = await this.workspacesRepository.findByUserId(userId);

      console.log(
        "✅ WorkspacesService getUserWorkspaces - Found:",
        workspaces.length
      );
      return workspaces;
    } catch (error) {
      console.error("❌ WorkspacesService getUserWorkspaces error:", error);
      throw error;
    }
  }
}
