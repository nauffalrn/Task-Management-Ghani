import { BaseService } from "../../common/service/base.service.js";
import { MembersRepository } from "./members.repo.js";
import { WorkspacesRepository } from "../workspaces/workspaces.repo.js";
import { UsersRepository } from "../users/users.repo.js";
import {
  WORKSPACE_ROLES,
  canManageWorkspaceMembers,
  ROLES,
  GLOBAL_ACCESS_ROLES,
  isDepartmentHead,
  getDepartmentFromRole,
} from "../../common/constants/roles.js";
import { HTTP_STATUS } from "../../common/constants/app.js";

export class MembersService extends BaseService {
  constructor() {
    const membersRepo = new MembersRepository();
    super(membersRepo, "Member");
    this.workspacesRepo = new WorkspacesRepository();
    this.usersRepo = new UsersRepository();
  }

  async getWorkspaceMembers(workspaceId, user) {
    try {
      // Check if workspace exists and user has access
      const workspace = await this.workspacesRepo.findById(workspaceId);
      if (!workspace) {
        const error = new Error("Workspace not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Check access
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const hasAccess = userWorkspaces.some((ws) => ws.id === workspaceId);

        if (!hasAccess) {
          const error = new Error("Access denied to this workspace");
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }
      }

      const members = await this.repository.findByWorkspaceId(workspaceId);
      return members;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to get workspace members: ${error.message}`);
    }
  }

  async addMember(workspaceId, memberData, requestingUser) {
    try {
      // Get workspace info
      const workspace = await this.workspacesRepo.findById(workspaceId);
      if (!workspace) {
        const error = new Error("Workspace not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Check permissions
      if (!canManageWorkspaceMembers(requestingUser.role, workspace.name)) {
        const error = new Error(
          "Access denied. Only Manager and relevant Department Heads can manage members"
        );
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      const { userId, role } = memberData;

      // Validate required fields
      if (!userId || !role) {
        const error = new Error("User ID and role are required");
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      // Validate workspace role
      if (!Object.values(WORKSPACE_ROLES).includes(role)) {
        const error = new Error(
          `Invalid workspace role. Valid roles are: ${Object.values(
            WORKSPACE_ROLES
          ).join(", ")}`
        );
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      // Check if user exists
      const targetUser = await this.usersRepo.findById(userId);
      if (!targetUser) {
        const error = new Error("Target user not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Department heads can only add users from their department
      if (isDepartmentHead(requestingUser.role)) {
        const requestingUserDepartment = getDepartmentFromRole(
          requestingUser.role
        );
        const targetUserDepartment = getDepartmentFromRole(targetUser.role);

        if (
          targetUserDepartment !== requestingUserDepartment &&
          workspace.name !== "Independence Day"
        ) {
          const error = new Error(
            `Access denied. You can only add users from ${requestingUserDepartment} department to this workspace`
          );
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }
      }

      // Check if user is already a member
      const existingMember = await this.repository.findMember(
        workspaceId,
        userId
      );
      if (existingMember) {
        const error = new Error("User is already a member of this workspace");
        error.statusCode = HTTP_STATUS.CONFLICT;
        throw error;
      }

      const newMember = await this.repository.addMember({
        workspaceId,
        userId,
        role,
      });

      return newMember;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to add member: ${error.message}`);
    }
  }

  async updateMember(workspaceId, userId, memberData, user) {
    try {
      // Check if workspace exists
      const workspace = await this.workspacesRepo.findById(workspaceId);
      if (!workspace) {
        const error = new Error("Workspace not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Check permissions
      if (!canManageWorkspaceMembers(user.role, workspace.name)) {
        const error = new Error(
          "Access denied. Only Manager and relevant Department Heads can manage members"
        );
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      // Find existing member
      const existingMember = await this.repository.findMember(
        workspaceId,
        userId
      );
      if (!existingMember) {
        const error = new Error("Member not found in this workspace");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Validate workspace role if provided
      if (
        memberData.role &&
        !Object.values(WORKSPACE_ROLES).includes(memberData.role)
      ) {
        const error = new Error("Invalid workspace role");
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      const updatedMember = await this.repository.updateMember(
        existingMember.id,
        memberData
      );

      return updatedMember;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to update member: ${error.message}`);
    }
  }

  async removeMember(workspaceId, userId, user) {
    try {
      // Check if workspace exists
      const workspace = await this.workspacesRepo.findById(workspaceId);
      if (!workspace) {
        const error = new Error("Workspace not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Check permissions
      if (!canManageWorkspaceMembers(user.role, workspace.name)) {
        const error = new Error(
          "Access denied. Only Manager and relevant Department Heads can manage members"
        );
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      // Find existing member
      const existingMember = await this.repository.findMember(
        workspaceId,
        userId
      );
      if (!existingMember) {
        const error = new Error("Member not found in this workspace");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      await this.repository.removeMemberByIds(workspaceId, userId);
      return existingMember;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to remove member: ${error.message}`);
    }
  }
}
