import { BaseRepository } from "../../common/repository/base.repository.js";
import {
  workspacesMembers,
  users,
  workspaces,
} from "../../../drizzle/schema.js";
import { eq, and } from "drizzle-orm";

export class MembersRepository extends BaseRepository {
  constructor() {
    super(workspacesMembers, "member");
  }

  async findByWorkspaceId(workspaceId) {
    try {
      const result = await this.db
        .select({
          id: workspacesMembers.id,
          userId: workspacesMembers.userId,
          userName: users.name,
          userEmail: users.email,
          userRole: users.role,
          workspaceRole: workspacesMembers.role,
          createdAt: workspacesMembers.createdAt,
          updatedAt: workspacesMembers.updatedAt,
        })
        .from(workspacesMembers)
        .innerJoin(users, eq(workspacesMembers.userId, users.id))
        .where(eq(workspacesMembers.workspaceId, workspaceId));

      return result;
    } catch (error) {
      throw new Error(
        `Failed to find members by workspace ID: ${error.message}`
      );
    }
  }

  async findMember(workspaceId, userId) {
    try {
      const result = await this.db
        .select()
        .from(workspacesMembers)
        .where(
          and(
            eq(workspacesMembers.workspaceId, workspaceId),
            eq(workspacesMembers.userId, userId)
          )
        );
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to find member: ${error.message}`);
    }
  }

  async addMember(memberData) {
    try {
      const result = await this.db
        .insert(workspacesMembers)
        .values(memberData)
        .returning();
      return result[0];
    } catch (error) {
      throw new Error(`Failed to add member: ${error.message}`);
    }
  }

  async updateMember(id, memberData) {
    try {
      const updateData = {
        ...memberData,
        updatedAt: new Date(),
      };

      const result = await this.db
        .update(workspacesMembers)
        .set(updateData)
        .where(eq(workspacesMembers.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to update member: ${error.message}`);
    }
  }

  async removeMemberByIds(workspaceId, userId) {
    try {
      const result = await this.db
        .delete(workspacesMembers)
        .where(
          and(
            eq(workspacesMembers.workspaceId, workspaceId),
            eq(workspacesMembers.userId, userId)
          )
        )
        .returning();
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to remove member: ${error.message}`);
    }
  }

  async findByUserId(userId) {
    try {
      const result = await this.db
        .select({
          id: workspacesMembers.id,
          workspaceId: workspacesMembers.workspaceId,
          workspaceName: workspaces.name,
          role: workspacesMembers.role,
          createdAt: workspacesMembers.createdAt,
        })
        .from(workspacesMembers)
        .innerJoin(workspaces, eq(workspacesMembers.workspaceId, workspaces.id))
        .where(eq(workspacesMembers.userId, userId));
      return result;
    } catch (error) {
      throw new Error(
        `Failed to find memberships by user ID: ${error.message}`
      );
    }
  }
}
