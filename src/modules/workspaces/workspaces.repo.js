import { BaseRepository } from "../../common/repository/base.repository.js";
import {
  workspaces,
  workspacesMembers,
  users,
} from "../../../drizzle/schema.js";
import { eq, like, or } from "drizzle-orm";

export class WorkspacesRepository extends BaseRepository {
  constructor() {
    super(workspaces, "workspace");
  }

  async findAll(search = "") {
    try {
      let query = this.db
        .select({
          id: workspaces.id,
          name: workspaces.name,
          description: workspaces.description,
          createdAt: workspaces.createdAt,
          updatedAt: workspaces.updatedAt,
        })
        .from(workspaces);

      if (search) {
        query = query.where(
          or(
            like(workspaces.name, `%${search}%`),
            like(workspaces.description, `%${search}%`)
          )
        );
      }

      return await query;
    } catch (error) {
      throw new Error(`Failed to find all workspaces: ${error.message}`);
    }
  }

  async findByUserId(userId) {
    try {
      const result = await this.db
        .select({
          id: workspaces.id,
          name: workspaces.name,
          description: workspaces.description,
          createdAt: workspaces.createdAt,
          updatedAt: workspaces.updatedAt,
          userRole: workspacesMembers.role,
        })
        .from(workspaces)
        .innerJoin(
          workspacesMembers,
          eq(workspaces.id, workspacesMembers.workspaceId)
        )
        .where(eq(workspacesMembers.userId, userId));

      return result;
    } catch (error) {
      throw new Error(`Failed to find workspaces by user ID: ${error.message}`);
    }
  }

  async getWorkspaceMembers(workspaceId) {
    try {
      const result = await this.db
        .select({
          id: workspacesMembers.id,
          userId: workspacesMembers.userId,
          userName: users.name,
          userRole: users.role,
          workspaceRole: workspacesMembers.role,
          createdAt: workspacesMembers.createdAt,
        })
        .from(workspacesMembers)
        .innerJoin(users, eq(workspacesMembers.userId, users.id))
        .where(eq(workspacesMembers.workspaceId, workspaceId));

      return result;
    } catch (error) {
      throw new Error(`Failed to get workspace members: ${error.message}`);
    }
  }

  async getWorkspaceStats(workspaceId) {
    try {
      // This would require joining with tasks table
      // Implementation depends on your specific requirements
      const members = await this.getWorkspaceMembers(workspaceId);

      return {
        totalMembers: members.length,
        adminCount: members.filter((m) => m.workspaceRole === "admin").length,
        memberCount: members.filter((m) => m.workspaceRole === "member").length,
      };
    } catch (error) {
      throw new Error(`Failed to get workspace stats: ${error.message}`);
    }
  }
}
