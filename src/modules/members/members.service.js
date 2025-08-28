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

export class MembersService {
  constructor() {
    this.membersRepo = new MembersRepository();
    this.workspacesRepo = new WorkspacesRepository();
    this.usersRepo = new UsersRepository();
  }

  async getWorkspaceMembers(workspaceId, user) {
    try {
      // Check if workspace exists and user has access
      const workspace = await this.workspacesRepo.findById(workspaceId);
      if (!workspace) {
        throw new Error("Workspace not found");
      }

      // Check access
      if (!GLOBAL_ACCESS_ROLES.includes(user.role)) {
        const userWorkspaces = await this.workspacesRepo.findByUserId(user.id);
        const hasAccess = userWorkspaces.some((ws) => ws.id === workspaceId);

        if (!hasAccess) {
          throw new Error("Access denied to this workspace");
        }
      }

      const members = await this.membersRepo.findByWorkspaceId(workspaceId);

      return {
        success: true,
        message: "Workspace members retrieved successfully",
        data: { members },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async addMember(workspaceId, memberData, requestingUser) {
    try {
      // Get workspace info
      const workspace = await this.workspacesRepo.findById(workspaceId);
      if (!workspace) {
        throw new Error("Workspace not found");
      }

      // Check permissions
      if (!canManageWorkspaceMembers(requestingUser.role, workspace.name)) {
        throw new Error(
          "Access denied. Only Manager and relevant Department Heads can manage members"
        );
      }

      // Owner override logging
      if (requestingUser.role === ROLES.OWNER) {
        console.log(
          `⚠️ Owner override: Adding member to "${workspace.name}". Consider delegating to Manager/Department Head.`
        );
      }

      const { userId, role } = memberData;

      // Validate required fields
      if (!userId || !role) {
        throw new Error("User ID and role are required");
      }

      // Validate workspace role
      if (!Object.values(WORKSPACE_ROLES).includes(role)) {
        throw new Error(
          `Invalid workspace role. Valid roles are: ${Object.values(
            WORKSPACE_ROLES
          ).join(", ")}`
        );
      }

      // REVISI: Department heads can only add users from their department
      if (isDepartmentHead(requestingUser.role)) {
        const targetUser = await this.usersRepo.findById(userId);
        if (!targetUser) {
          throw new Error("Target user not found");
        }

        const requestingUserDepartment = getDepartmentFromRole(
          requestingUser.role
        );
        const targetUserDepartment = getDepartmentFromRole(targetUser.role);

        // Allow adding users from same department OR to general workspace
        if (
          targetUserDepartment !== requestingUserDepartment &&
          workspace.name !== "Independence Day"
        ) {
          throw new Error(
            `Access denied. You can only add users from ${requestingUserDepartment} department to this workspace`
          );
        }
      }

      // Check if user is already a member
      const existingMember = await this.membersRepo.findMember(
        workspaceId,
        userId
      );
      if (existingMember) {
        throw new Error("User is already a member of this workspace");
      }

      const newMember = await this.membersRepo.addMember({
        workspaceId,
        userId,
        role,
      });

      return {
        success: true,
        message: "Member added successfully",
        data: {
          member: newMember,
          managedBy: requestingUser.role,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateMember(workspaceId, userId, memberData, user) {
    try {
      // Check if workspace exists
      const workspace = await this.workspacesRepo.findById(workspaceId);
      if (!workspace) {
        throw new Error("Workspace not found");
      }

      // Check permissions
      if (!canManageWorkspaceMembers(user.role, workspace.name)) {
        throw new Error(
          "Access denied. Only Manager and relevant Department Heads can manage members"
        );
      }

      // REVISI: Department heads can only manage users from their department
      if (isDepartmentHead(user.role)) {
        const targetUser = await this.usersRepo.findById(userId);
        if (!targetUser) {
          throw new Error("Target user not found");
        }

        const requestingUserDepartment = getDepartmentFromRole(user.role);
        const targetUserDepartment = getDepartmentFromRole(targetUser.role);

        if (
          targetUserDepartment !== requestingUserDepartment &&
          workspace.name !== "Independence Day"
        ) {
          throw new Error(
            `Access denied. You can only manage users from ${requestingUserDepartment} department`
          );
        }
      }

      // Find existing member
      const existingMember = await this.membersRepo.findMember(
        workspaceId,
        userId
      );
      if (!existingMember) {
        throw new Error("Member not found in this workspace");
      }

      // Validate workspace role if provided
      if (
        memberData.role &&
        !Object.values(WORKSPACE_ROLES).includes(memberData.role)
      ) {
        throw new Error("Invalid workspace role");
      }

      const updatedMember = await this.membersRepo.updateMember(
        existingMember.id,
        memberData
      );

      return {
        success: true,
        message: "Member updated successfully",
        data: { member: updatedMember },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async removeMember(workspaceId, userId, user) {
    try {
      // Check if workspace exists
      const workspace = await this.workspacesRepo.findById(workspaceId);
      if (!workspace) {
        throw new Error("Workspace not found");
      }

      // Check permissions
      if (!canManageWorkspaceMembers(user.role, workspace.name)) {
        throw new Error(
          "Access denied. Only Manager and relevant Department Heads can manage members"
        );
      }

      // REVISI: Department heads can only remove users from their department
      if (isDepartmentHead(user.role)) {
        const targetUser = await this.usersRepo.findById(userId);
        if (!targetUser) {
          throw new Error("Target user not found");
        }

        const requestingUserDepartment = getDepartmentFromRole(user.role);
        const targetUserDepartment = getDepartmentFromRole(targetUser.role);

        if (
          targetUserDepartment !== requestingUserDepartment &&
          workspace.name !== "Independence Day"
        ) {
          throw new Error(
            `Access denied. You can only remove users from ${requestingUserDepartment} department`
          );
        }
      }

      // Find existing member
      const existingMember = await this.membersRepo.findMember(
        workspaceId,
        userId
      );
      if (!existingMember) {
        throw new Error("Member not found in this workspace");
      }

      await this.membersRepo.removeMemberByIds(workspaceId, userId);

      return {
        success: true,
        message: "Member removed successfully",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
