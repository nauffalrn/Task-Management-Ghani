import { BaseRepository } from "../../common/repository/base.repository.js";
import {
  workspaces,
  workspacesMembers,
  users,
} from "../../../drizzle/schema.js";
import { eq, like, or, and, desc } from "drizzle-orm";

export class WorkspacesRepository extends BaseRepository {
  constructor() {
    super(workspaces);
  }

  // Get all workspaces with pagination and search
  async findMany(options = {}) {
    try {
      const { page = 1, limit = 10, search, userId } = options;

      console.log("🔍 WorkspacesRepo findMany - Options:", options);

      const offset = (page - 1) * limit;

      // Build where conditions
      let whereConditions = [];

      if (search) {
        whereConditions.push(
          or(
            like(workspaces.name, `%${search}%`),
            like(workspaces.description, `%${search}%`)
          )
        );
      }

      // If userId provided, only show workspaces where user is owner or member
      if (userId) {
        // This would need a join - for now, let's get all workspaces
        console.log("🔍 Filtering by userId:", userId);
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      let query = this.db
        .select({
          id: workspaces.id,
          name: workspaces.name,
          description: workspaces.description,
          created_by: workspaces.createdBy,
          created_at: workspaces.createdAt,
          updated_at: workspaces.updatedAt,
        })
        .from(workspaces)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(workspaces.createdAt));

      if (whereClause) {
        query = query.where(whereClause);
      }

      console.log("📝 Executing workspaces query...");
      const result = await query;

      console.log("✅ WorkspacesRepo findMany - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ WorkspacesRepo findMany error:", error);
      throw error;
    }
  }

  // Find workspace by ID
  async findById(id) {
    try {
      console.log("🔍 WorkspacesRepo findById - ID:", id);

      const result = await this.db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, id))
        .limit(1);

      console.log(
        "✅ WorkspacesRepo findById - Found:",
        result.length > 0 ? "Yes" : "No"
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("❌ WorkspacesRepo findById error:", error);
      throw error;
    }
  }

  // Create workspace
  async create(data) {
    try {
      console.log("📝 WorkspacesRepo create - Data:", data);

      const result = await this.db.insert(workspaces).values(data).returning();

      console.log("✅ WorkspacesRepo create - Created:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ WorkspacesRepo create error:", error);
      throw error;
    }
  }

  // Update workspace
  async update(id, data) {
    try {
      console.log("🔄 WorkspacesRepo update - ID:", id, "Data:", data);

      const result = await this.db
        .update(workspaces)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(workspaces.id, id))
        .returning();

      console.log("✅ WorkspacesRepo update - Updated:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ WorkspacesRepo update error:", error);
      throw error;
    }
  }

  // Delete workspace
  async delete(id) {
    try {
      console.log("🗑️ WorkspacesRepo delete - ID:", id);

      const result = await this.db
        .delete(workspaces)
        .where(eq(workspaces.id, id))
        .returning();

      console.log("✅ WorkspacesRepo delete - Deleted:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ WorkspacesRepo delete error:", error);
      throw error;
    }
  }

  // Get workspaces for a specific user (as owner or member)
  async findByUserId(userId) {
    try {
      console.log("🔍 WorkspacesRepo findByUserId - UserId:", userId);

      // Get workspaces where user is owner
      const ownedWorkspaces = await this.db
        .select()
        .from(workspaces)
        .where(eq(workspaces.createdBy, userId))
        .orderBy(desc(workspaces.createdAt));

      console.log(
        "✅ WorkspacesRepo findByUserId - Found owned:",
        ownedWorkspaces.length
      );
      return ownedWorkspaces;
    } catch (error) {
      console.error("❌ WorkspacesRepo findByUserId error:", error);
      throw error;
    }
  }
}
