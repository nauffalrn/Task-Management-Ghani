import { BaseService } from "../../common/service/base.service.js";
import { MembersRepository } from "./members.repo.js";
import { WorkspacesRepository } from "../workspaces/workspaces.repo.js";
import { UsersRepository } from "../users/users.repo.js";
import { AppError } from "../../common/utils/appError.js";

export class MembersService extends BaseService {
  constructor() {
    super();
    this.membersRepository = new MembersRepository();
    this.workspacesRepository = new WorkspacesRepository();
    this.usersRepository = new UsersRepository();
  }

  // Get all members
  async getAllMembers(options = {}) {
    try {
      const { page = 1, limit = 10, search, workspaceId, role } = options;

      console.log("🔍 MembersService getAllMembers - Options:", options);

      const members = await this.membersRepository.findMany({
        page,
        limit,
        search,
        workspaceId,
        role,
      });

      console.log("✅ MembersService getAllMembers - Found:", members.length);
      return members;
    } catch (error) {
      console.error("❌ MembersService getAllMembers error:", error);
      throw error;
    }
  }

  // Get member by ID
  async getMemberById(id) {
    try {
      console.log("🔍 MembersService getMemberById - ID:", id);

      const member = await this.membersRepository.findById(id);
      if (!member) {
        throw AppError.notFound("Member not found");
      }

      console.log("✅ MembersService getMemberById - Found:", member.user_name);
      return member;
    } catch (error) {
      console.error("❌ MembersService getMemberById error:", error);
      throw error;
    }
  }

  // Add member to workspace
  async addMember(memberData, currentUserId) {
    try {
      const { workspaceId, userId, role = "member" } = memberData;

      console.log("📝 MembersService addMember - Data:", {
        workspaceId,
        userId,
        role,
        currentUserId,
      });

      // Validate workspace exists
      const workspace = await this.workspacesRepository.findById(workspaceId);
      if (!workspace) {
        throw AppError.notFound("Workspace not found");
      }

      // Validate user exists
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw AppError.notFound("User not found");
      }

      // Check if user is already a member
      const existingMember =
        await this.membersRepository.findByUserAndWorkspace(
          userId,
          workspaceId
        );
      if (existingMember) {
        throw AppError.conflict("User is already a member of this workspace");
      }

      // Add member
      const newMember = await this.membersRepository.create({
        workspaceId,
        userId,
        role,
      });

      console.log("✅ MembersService addMember - Added:", newMember.id);
      return newMember;
    } catch (error) {
      console.error("❌ MembersService addMember error:", error);
      throw error;
    }
  }

  // Update member role
  async updateMember(id, updateData, currentUserId) {
    try {
      console.log(
        "🔄 MembersService updateMember - ID:",
        id,
        "Data:",
        updateData
      );

      // Check if member exists
      const existingMember = await this.membersRepository.findById(id);
      if (!existingMember) {
        throw AppError.notFound("Member not found");
      }

      const updatedMember = await this.membersRepository.update(id, updateData);

      console.log(
        "✅ MembersService updateMember - Updated:",
        updatedMember.id
      );
      return updatedMember;
    } catch (error) {
      console.error("❌ MembersService updateMember error:", error);
      throw error;
    }
  }

  // Remove member from workspace
  async removeMember(id, currentUserId) {
    try {
      console.log("🗑️ MembersService removeMember - ID:", id);

      // Check if member exists
      const existingMember = await this.membersRepository.findById(id);
      if (!existingMember) {
        throw AppError.notFound("Member not found");
      }

      await this.membersRepository.delete(id);

      console.log(
        "✅ MembersService removeMember - Removed member:",
        existingMember.user_name
      );
      return true;
    } catch (error) {
      console.error("❌ MembersService removeMember error:", error);
      throw error;
    }
  }

  // Get members by workspace
  async getMembersByWorkspace(workspaceId) {
    try {
      console.log(
        "🔍 MembersService getMembersByWorkspace - WorkspaceId:",
        workspaceId
      );

      // Validate workspace exists
      const workspace = await this.workspacesRepository.findById(workspaceId);
      if (!workspace) {
        throw AppError.notFound("Workspace not found");
      }

      const members = await this.membersRepository.findByWorkspaceId(
        workspaceId
      );

      console.log(
        "✅ MembersService getMembersByWorkspace - Found:",
        members.length
      );
      return members;
    } catch (error) {
      console.error("❌ MembersService getMembersByWorkspace error:", error);
      throw error;
    }
  }
}
