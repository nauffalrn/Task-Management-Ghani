import { BaseRepository } from "../../common/repository/base.repository.js";
import { tasks, users, workspaces } from "../../../drizzle/schema.js";
import { eq, like, or, and, desc } from "drizzle-orm";

export class TasksRepository extends BaseRepository {
  constructor() {
    super(tasks);
  }

  // Get all tasks with pagination and search
  async findMany(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        workspaceId,
        status,
        assignedTo,
      } = options;

      console.log("🔍 TasksRepo findMany - Options:", options);

      const offset = (page - 1) * limit;

      // Build where conditions
      let whereConditions = [];

      if (search) {
        whereConditions.push(
          or(
            like(tasks.title, `%${search}%`),
            like(tasks.description, `%${search}%`)
          )
        );
      }

      if (workspaceId) {
        whereConditions.push(eq(tasks.workspaceId, workspaceId));
      }

      if (status) {
        whereConditions.push(eq(tasks.status, status));
      }

      if (assignedTo) {
        whereConditions.push(eq(tasks.assignedTo, assignedTo));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      let query = this.db
        .select({
          id: tasks.id,
          workspace_id: tasks.workspaceId,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          assigned_to: tasks.assignedTo,
          created_by: tasks.createdBy,
          due_date: tasks.dueDate,
          created_at: tasks.createdAt,
          updated_at: tasks.updatedAt,
        })
        .from(tasks)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(tasks.createdAt));

      if (whereClause) {
        query = query.where(whereClause);
      }

      console.log("📝 Executing tasks query...");
      const result = await query;

      console.log("✅ TasksRepo findMany - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ TasksRepo findMany error:", error);
      throw error;
    }
  }

  // Find task by ID
  async findById(id) {
    try {
      console.log("🔍 TasksRepo findById - ID:", id);

      const result = await this.db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1);

      console.log(
        "✅ TasksRepo findById - Found:",
        result.length > 0 ? "Yes" : "No"
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("❌ TasksRepo findById error:", error);
      throw error;
    }
  }

  // Create task
  async create(data) {
    try {
      console.log("📝 TasksRepo create - Data:", data);

      const result = await this.db.insert(tasks).values(data).returning();

      console.log("✅ TasksRepo create - Created:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ TasksRepo create error:", error);
      throw error;
    }
  }

  // Update task
  async update(id, data) {
    try {
      console.log("🔄 TasksRepo update - ID:", id, "Data:", data);

      const result = await this.db
        .update(tasks)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(tasks.id, id))
        .returning();

      console.log("✅ TasksRepo update - Updated:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ TasksRepo update error:", error);
      throw error;
    }
  }

  // Delete task
  async delete(id) {
    try {
      console.log("🗑️ TasksRepo delete - ID:", id);

      const result = await this.db
        .delete(tasks)
        .where(eq(tasks.id, id))
        .returning();

      console.log("✅ TasksRepo delete - Deleted:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ TasksRepo delete error:", error);
      throw error;
    }
  }

  // Get tasks by workspace ID
  async findByWorkspaceId(workspaceId) {
    try {
      console.log("🔍 TasksRepo findByWorkspaceId - WorkspaceId:", workspaceId);

      const result = await this.db
        .select()
        .from(tasks)
        .where(eq(tasks.workspaceId, workspaceId))
        .orderBy(desc(tasks.createdAt));

      console.log("✅ TasksRepo findByWorkspaceId - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ TasksRepo findByWorkspaceId error:", error);
      throw error;
    }
  }

  // Get tasks assigned to user
  async findByAssignedTo(userId) {
    try {
      console.log("🔍 TasksRepo findByAssignedTo - UserId:", userId);

      const result = await this.db
        .select()
        .from(tasks)
        .where(eq(tasks.assignedTo, userId))
        .orderBy(desc(tasks.createdAt));

      console.log("✅ TasksRepo findByAssignedTo - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ TasksRepo findByAssignedTo error:", error);
      throw error;
    }
  }
}
