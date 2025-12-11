import { BaseRepository } from "../../common/repository/base.repository.js";
import {
  workspacesMembers,
  users,
  workspaces,
} from "../../../drizzle/schema.js";
import { eq, like, or, and, desc } from "drizzle-orm";

export class MembersRepository extends BaseRepository {
  constructor() {
    super(workspacesMembers);
  }

  // Get all members with pagination and search
  async findMany(options = {}) {
    try {
      const { page = 1, limit = 10, search, workspaceId, role } = options;

      console.log("🔍 MembersRepo findMany - Options:", options);

      const offset = (page - 1) * limit;

      // Build where conditions
      let whereConditions = [];

      if (workspaceId) {
        whereConditions.push(eq(workspacesMembers.workspaceId, workspaceId));
      }

      if (role) {
        whereConditions.push(eq(workspacesMembers.role, role));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Join with users table to get user details
      let query = this.db
        .select({
          id: workspacesMembers.id,
          workspace_id: workspacesMembers.workspaceId,
          user_id: workspacesMembers.userId,
          role: workspacesMembers.role,
          created_at: workspacesMembers.createdAt,
          user_name: users.name,
          user_email: users.email,
          user_role: users.role,
        })
        .from(workspacesMembers)
        .innerJoin(users, eq(workspacesMembers.userId, users.id))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(workspacesMembers.createdAt));

      if (whereClause) {
        query = query.where(whereClause);
      }

      console.log("📝 Executing members query...");
      const result = await query;

      console.log("✅ MembersRepo findMany - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ MembersRepo findMany error:", error);
      throw error;
    }
  }

  // Find member by ID
  async findById(id) {
    try {
      console.log("🔍 MembersRepo findById - ID:", id);

      const result = await this.db
        .select({
          id: workspacesMembers.id,
          workspace_id: workspacesMembers.workspaceId,
          user_id: workspacesMembers.userId,
          role: workspacesMembers.role,
          created_at: workspacesMembers.createdAt,
          user_name: users.name,
          user_email: users.email,
          user_role: users.role,
        })
        .from(workspacesMembers)
        .innerJoin(users, eq(workspacesMembers.userId, users.id))
        .where(eq(workspacesMembers.id, id))
        .limit(1);

      console.log(
        "✅ MembersRepo findById - Found:",
        result.length > 0 ? "Yes" : "No"
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("❌ MembersRepo findById error:", error);
      throw error;
    }
  }

  // Create member
  async create(data) {
    try {
      console.log("📝 MembersRepo create - Data:", data);

      const result = await this.db
        .insert(workspacesMembers)
        .values(data)
        .returning();

      console.log("✅ MembersRepo create - Created:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ MembersRepo create error:", error);
      throw error;
    }
  }

  // Update member
  async update(id, data) {
    try {
      console.log("🔄 MembersRepo update - ID:", id, "Data:", data);

      const result = await this.db
        .update(workspacesMembers)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(workspacesMembers.id, id))
        .returning();

      console.log("✅ MembersRepo update - Updated:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ MembersRepo update error:", error);
      throw error;
    }
  }

  // Delete member
  async delete(id) {
    try {
      console.log("🗑️ MembersRepo delete - ID:", id);

      const result = await this.db
        .delete(workspacesMembers)
        .where(eq(workspacesMembers.id, id))
        .returning();

      console.log("✅ MembersRepo delete - Deleted:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ MembersRepo delete error:", error);
      throw error;
    }
  }

  // Get members by workspace ID
  async findByWorkspaceId(workspaceId) {
    try {
      console.log(
        "🔍 MembersRepo findByWorkspaceId - WorkspaceId:",
        workspaceId
      );

      const result = await this.db
        .select({
          id: workspacesMembers.id,
          workspace_id: workspacesMembers.workspaceId,
          user_id: workspacesMembers.userId,
          role: workspacesMembers.role,
          created_at: workspacesMembers.createdAt,
          user_name: users.name,
          user_email: users.email,
          user_role: users.role,
        })
        .from(workspacesMembers)
        .innerJoin(users, eq(workspacesMembers.userId, users.id))
        .where(eq(workspacesMembers.workspaceId, workspaceId))
        .orderBy(desc(workspacesMembers.createdAt));

      console.log("✅ MembersRepo findByWorkspaceId - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ MembersRepo findByWorkspaceId error:", error);
      throw error;
    }
  }

  // Check if user is member of workspace
  async findByUserAndWorkspace(userId, workspaceId) {
    try {
      console.log(
        "🔍 MembersRepo findByUserAndWorkspace - UserId:",
        userId,
        "WorkspaceId:",
        workspaceId
      );

      const result = await this.db
        .select()
        .from(workspacesMembers)
        .where(
          and(
            eq(workspacesMembers.userId, userId),
            eq(workspacesMembers.workspaceId, workspaceId)
          )
        )
        .limit(1);

      console.log(
        "✅ MembersRepo findByUserAndWorkspace - Found:",
        result.length > 0 ? "Yes" : "No"
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("❌ MembersRepo findByUserAndWorkspace error:", error);
      throw error;
    }
  }
}
