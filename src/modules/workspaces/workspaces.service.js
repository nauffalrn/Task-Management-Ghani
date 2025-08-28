import { WorkspacesRepository } from "./workspaces.repo.js";
import {
  ROLES,
  GLOBAL_ACCESS_ROLES,
  canCreateWorkspace,
  GENERAL_WORKSPACE_CREATOR_ROLES,
  GENERAL_WORKSPACE_NAME,
  isDepartmentHead,
  getDepartmentFromRole,
} from "../../common/constants/roles.js";

export class WorkspacesService {
  constructor() {
    this.workspacesRepo = new WorkspacesRepository();
  }

  async createWorkspace(workspaceData, user) {
    try {
      const { name, description } = workspaceData;

      // Validate required fields
      if (!name) {
        throw new Error("Workspace name is required");
      }

      // Check if this is a general workspace
      if (
        name === GENERAL_WORKSPACE_NAME ||
        name.toLowerCase().includes("general")
      ) {
        if (
          !GENERAL_WORKSPACE_CREATOR_ROLES.includes(user.role) &&
          user.role !== ROLES.OWNER
        ) {
          throw new Error(
            "Access denied. Only Manager can create general workspaces"
          );
        }

        if (user.role === ROLES.OWNER) {
          console.log(
            "⚠️ Owner override: Creating general workspace. Consider delegating to Manager."
          );
        }
      } else {
        // Regular workspace creation rules
        if (!canCreateWorkspace(user.role)) {
          throw new Error(
            "Access denied. Only Manager and Department Heads can create workspaces"
          );
        }

        if (user.role === ROLES.OWNER) {
          console.log(
            "⚠️ Owner override: Creating workspace. Consider delegating to Manager/Department Head."
          );
        }
      }

      const newWorkspace = await this.workspacesRepo.create({
        name,
        description: description || null,
      });

      return {
        success: true,
        message: "Workspace created successfully",
        data: {
          workspace: newWorkspace,
          createdBy: user.role,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllWorkspaces(user, search = "") {
    try {
      let workspacesList;

      // If user has global access, get all workspaces
      if (GLOBAL_ACCESS_ROLES.includes(user.role)) {
        workspacesList = await this.workspacesRepo.findAll(search);
      } else {
        // REVISI: Get only workspaces where user is explicitly a member
        // Department heads cannot see other department workspaces unless added as member
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);

        // If search is provided, filter by search term
        if (search) {
          workspacesList = userWorkspaces.filter(
            (ws) =>
              ws.name.toLowerCase().includes(search.toLowerCase()) ||
              (ws.description &&
                ws.description.toLowerCase().includes(search.toLowerCase()))
          );
        } else {
          workspacesList = userWorkspaces;
        }
      }

      return {
        success: true,
        message: "Workspaces retrieved successfully",
        data: {
          workspaces: workspacesList,
          userRole: user.role,
          canCreate: canCreateWorkspace(user.role),
          isSupervising: user.role === ROLES.OWNER,
          accessNote: isDepartmentHead(user.role)
            ? "You can only see workspaces where you are added as a member"
            : null,
        },
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

      // REVISI: Strict access control - must be member or have global access
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const hasAccess = userWorkspaces.some((ws) => ws.id === id);

        if (!hasAccess) {
          throw new Error(
            "Access denied to this workspace. You must be added as a member by workspace admin."
          );
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
