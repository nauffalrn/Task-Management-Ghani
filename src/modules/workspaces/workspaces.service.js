import { WorkspacesRepository } from "./workspaces.repo.js";
import {
  ROLES,
  GLOBAL_ACCESS_ROLES,
  WORKSPACE_CREATOR_ROLES,
} from "../../common/constants/roles.js";

export class WorkspacesService {
  constructor() {
    this.workspacesRepo = new WorkspacesRepository();
  }

  async getAllWorkspaces(user, search = "") {
    try {
      let workspacesList;

      // If user has global access, get all workspaces
      if (GLOBAL_ACCESS_ROLES.includes(user.role)) {
        workspacesList = await this.workspacesRepo.findAll(search);
      } else {
        // Get only workspaces where user is a member
        workspacesList = await this.workspacesRepo.findByUserId(user.id);
      }

      return {
        success: true,
        message: "Workspaces retrieved successfully",
        data: { workspaces: workspacesList },
      };
    } catch (error) {
      throw new Error(`Failed to get workspaces: ${error.message}`);
    }
  }

  async getWorkspaceById(id, user) {
    try {
      const workspace = await this.workspacesRepo.findById(id);

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      // Check if user has access to this workspace
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const hasAccess = userWorkspaces.some((ws) => ws.id === id);

        if (!hasAccess) {
          throw new Error("Access denied to this workspace");
        }
      }

      // Get workspace members
      const members = await this.workspacesRepo.getWorkspaceMembers(id);

      return {
        success: true,
        message: "Workspace retrieved successfully",
        data: {
          workspace: {
            ...workspace,
            members,
          },
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createWorkspace(workspaceData, user) {
    try {
      const { name, description } = workspaceData;

      // Check if user can create workspaces
      if (!WORKSPACE_CREATOR_ROLES.includes(user.role)) {
        throw new Error("Access denied. You cannot create workspaces");
      }

      // Validate required fields
      if (!name) {
        throw new Error("Workspace name is required");
      }

      const newWorkspace = await this.workspacesRepo.create({
        name,
        description: description || null,
      });

      return {
        success: true,
        message: "Workspace created successfully",
        data: { workspace: newWorkspace },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateWorkspace(id, workspaceData, user) {
    try {
      const workspace = await this.workspacesRepo.findById(id);
      if (!workspace) {
        throw new Error("Workspace not found");
      }

      // Check permissions
      if (
        !GLOBAL_ACCESS_ROLES.includes(user.role) &&
        !WORKSPACE_CREATOR_ROLES.includes(user.role)
      ) {
        throw new Error("Access denied. You cannot update workspaces");
      }

      const updatedWorkspace = await this.workspacesRepo.update(
        id,
        workspaceData
      );

      return {
        success: true,
        message: "Workspace updated successfully",
        data: { workspace: updatedWorkspace },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteWorkspace(id, user) {
    try {
      const workspace = await this.workspacesRepo.findById(id);
      if (!workspace) {
        throw new Error("Workspace not found");
      }

      // Only managers can delete workspaces
      if (user.role !== ROLES.MANAGER) {
        throw new Error("Access denied. Only managers can delete workspaces");
      }

      await this.workspacesRepo.delete(id);

      return {
        success: true,
        message: "Workspace deleted successfully",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
