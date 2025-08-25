import { MembersRepository } from "./members.repo.js";
import { WorkspacesRepository } from "../workspaces/workspaces.repo.js";
import { UsersRepository } from "../users/users.repo.js";
import {
  WORKSPACE_ROLES,
  GLOBAL_ACCESS_ROLES,
  WORKSPACE_CREATOR_ROLES,
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

  async addMember(workspaceId, memberData, user) {
    try {
      const { userId, role = WORKSPACE_ROLES.MEMBER } = memberData;

      // Check if workspace exists
      const workspace = await this.workspacesRepo.findById(workspaceId);
      if (!workspace) {
        throw new Error("Workspace not found");
      }

      // Check if user can add members
      if (
        !GLOBAL_ACCESS_ROLES.includes(user.role) &&
        !WORKSPACE_CREATOR_ROLES.includes(user.role)
      ) {
        throw new Error("Access denied. You cannot add members");
      }

      // Check if target user exists
      const targetUser = await this.usersRepo.findById(userId);
      if (!targetUser) {
        throw new Error("User not found");
      }

      // Check if user is already a member
      const existingMember = await this.membersRepo.findMember(
        workspaceId,
        userId
      );
      if (existingMember) {
        throw new Error("User is already a member of this workspace");
      }

      // Validate workspace role
      if (!Object.values(WORKSPACE_ROLES).includes(role)) {
        throw new Error("Invalid workspace role");
      }

      const newMember = await this.membersRepo.addMember({
        workspaceId,
        userId,
        role,
      });

      return {
        success: true,
        message: "Member added successfully",
        data: { member: newMember },
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
      if (
        !GLOBAL_ACCESS_ROLES.includes(user.role) &&
        !WORKSPACE_CREATOR_ROLES.includes(user.role)
      ) {
        throw new Error("Access denied. You cannot update members");
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
      if (
        !GLOBAL_ACCESS_ROLES.includes(user.role) &&
        !WORKSPACE_CREATOR_ROLES.includes(user.role)
      ) {
        throw new Error("Access denied. You cannot remove members");
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
