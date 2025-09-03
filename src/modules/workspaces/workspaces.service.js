import { BaseService } from "../../common/service/base.service.js";
import { WorkspacesRepository } from "./workspaces.repo.js";
import {
  ROLES,
  GLOBAL_ACCESS_ROLES,
  canCreateWorkspace,
  WORKSPACE_CREATOR_ROLES,
  GENERAL_WORKSPACE_CREATOR_ROLES,
  GENERAL_WORKSPACE_NAME,
  isDepartmentHead,
  getDepartmentFromRole,
} from "../../common/constants/roles.js";
import { HTTP_STATUS } from "../../common/constants/app.js";

export class WorkspacesService extends BaseService {
  constructor() {
    const workspacesRepo = new WorkspacesRepository();
    super(workspacesRepo, "Workspace");
  }

  // Override create to add validation
  async create(workspaceData, user) {
    try {
      // Validate required fields
      if (!workspaceData.name) {
        const error = new Error("Workspace name is required");
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      // Check if user can create workspace
      if (!canCreateWorkspace(user.role)) {
        const error = new Error("Access denied. You cannot create workspaces");
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      // Check if it's a general workspace
      if (workspaceData.name === GENERAL_WORKSPACE_NAME) {
        if (!GENERAL_WORKSPACE_CREATOR_ROLES.includes(user.role)) {
          const error = new Error(
            "Access denied. Only Manager can create general workspace"
          );
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }
      }

      // Department heads can only create their department workspace
      if (isDepartmentHead(user.role)) {
        const userDepartment = getDepartmentFromRole(user.role);
        const expectedWorkspaceName = userDepartment;

        if (
          !workspaceData.name
            .toLowerCase()
            .includes(expectedWorkspaceName.toLowerCase()) &&
          workspaceData.name !== GENERAL_WORKSPACE_NAME
        ) {
          const error = new Error(
            `Access denied. You can only create ${userDepartment} department workspace`
          );
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }
      }

      const workspace = await this.repository.create({
        ...workspaceData,
        createdBy: user.id,
      });

      return workspace;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to create workspace: ${error.message}`);
    }
  }

  async getAllWorkspaces(user, search = "") {
    try {
      let workspacesList;

      // If user has global access, get all workspaces
      if (GLOBAL_ACCESS_ROLES.includes(user.role)) {
        workspacesList = await this.repository.findAll(search);
      } else {
        // Get only workspaces where user is explicitly a member
        const userWorkspaces = await this.repository.findByUserId(user.id);

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

      return workspacesList;
    } catch (error) {
      throw new Error(`Failed to get workspaces: ${error.message}`);
    }
  }

  // Override getById to add access control
  async getById(id, user) {
    try {
      const workspace = await this.repository.findById(id);

      if (!workspace) {
        const error = new Error("Workspace not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Strict access control - must be member or have global access
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.repository.findByUserId(user.id);
        const hasAccess = userWorkspaces.some((ws) => ws.id === id);

        if (!hasAccess) {
          const error = new Error(
            "Access denied to this workspace. You must be added as a member by workspace admin."
          );
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }
      }

      // Get workspace members
      const members = await this.repository.getWorkspaceMembers(id);

      return {
        ...workspace,
        members,
      };
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to get workspace: ${error.message}`);
    }
  }

  // Override update to add validation
  async update(id, workspaceData, user) {
    try {
      const workspace = await this.repository.findById(id);
      if (!workspace) {
        const error = new Error("Workspace not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Check permissions
      if (
        !GLOBAL_ACCESS_ROLES.includes(user.role) &&
        !WORKSPACE_CREATOR_ROLES.includes(user.role)
      ) {
        const error = new Error("Access denied. You cannot update workspaces");
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      const updatedWorkspace = await this.repository.update(id, workspaceData);
      return updatedWorkspace;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to update workspace: ${error.message}`);
    }
  }

  // Override delete to add validation
  async delete(id, user) {
    try {
      const workspace = await this.repository.findById(id);
      if (!workspace) {
        const error = new Error("Workspace not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Check permissions
      if (
        !GLOBAL_ACCESS_ROLES.includes(user.role) &&
        !WORKSPACE_CREATOR_ROLES.includes(user.role)
      ) {
        const error = new Error("Access denied. You cannot delete workspaces");
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      const deletedWorkspace = await this.repository.delete(id);
      return deletedWorkspace;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to delete workspace: ${error.message}`);
    }
  }

  async getWorkspaceStats(workspaceId, user) {
    try {
      // Check access first
      await this.getById(workspaceId, user);

      const stats = await this.repository.getWorkspaceStats(workspaceId);
      return stats;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to get workspace stats: ${error.message}`);
    }
  }
}
