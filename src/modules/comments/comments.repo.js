import { BaseRepository } from "../../common/repository/base.repository.js";
import { comments, users, tasks } from "../../../drizzle/schema.js";
import { eq, like, or, and, desc } from "drizzle-orm";

export class CommentsRepository extends BaseRepository {
  constructor() {
    super(comments);
  }

  // Get all comments with pagination and search
  async findMany(options = {}) {
    try {
      const { page = 1, limit = 10, taskId } = options;

      console.log("🔍 CommentsRepo findMany - Options:", options);

      const offset = (page - 1) * limit;

      // Build where conditions
      let whereConditions = [];

      if (taskId) {
        whereConditions.push(eq(comments.taskId, taskId));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Join with users table to get user details
      let query = this.db
        .select({
          id: comments.id,
          task_id: comments.taskId,
          user_id: comments.userId,
          content: comments.content,
          created_at: comments.createdAt,
          updated_at: comments.updatedAt,
          user_name: users.name,
          user_email: users.email,
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(comments.createdAt));

      if (whereClause) {
        query = query.where(whereClause);
      }

      console.log("📝 Executing comments query...");
      const result = await query;

      console.log("✅ CommentsRepo findMany - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ CommentsRepo findMany error:", error);
      throw error;
    }
  }

  // Find comment by ID
  async findById(id) {
    try {
      console.log("🔍 CommentsRepo findById - ID:", id);

      const result = await this.db
        .select({
          id: comments.id,
          task_id: comments.taskId,
          user_id: comments.userId,
          content: comments.content,
          created_at: comments.createdAt,
          updated_at: comments.updatedAt,
          user_name: users.name,
          user_email: users.email,
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.id, id))
        .limit(1);

      console.log(
        "✅ CommentsRepo findById - Found:",
        result.length > 0 ? "Yes" : "No"
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("❌ CommentsRepo findById error:", error);
      throw error;
    }
  }

  // Create comment
  async create(data) {
    try {
      console.log("📝 CommentsRepo create - Data:", data);

      const result = await this.db.insert(comments).values(data).returning();

      console.log("✅ CommentsRepo create - Created:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ CommentsRepo create error:", error);
      throw error;
    }
  }

  // Update comment
  async update(id, data) {
    try {
      console.log("🔄 CommentsRepo update - ID:", id, "Data:", data);

      const result = await this.db
        .update(comments)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(comments.id, id))
        .returning();

      console.log("✅ CommentsRepo update - Updated:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ CommentsRepo update error:", error);
      throw error;
    }
  }

  // Delete comment
  async delete(id) {
    try {
      console.log("🗑️ CommentsRepo delete - ID:", id);

      const result = await this.db
        .delete(comments)
        .where(eq(comments.id, id))
        .returning();

      console.log("✅ CommentsRepo delete - Deleted:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ CommentsRepo delete error:", error);
      throw error;
    }
  }

  // Get comments by task ID
  async findByTaskId(taskId) {
    try {
      console.log("🔍 CommentsRepo findByTaskId - TaskId:", taskId);

      const result = await this.db
        .select({
          id: comments.id,
          task_id: comments.taskId,
          user_id: comments.userId,
          content: comments.content,
          created_at: comments.createdAt,
          updated_at: comments.updatedAt,
          user_name: users.name,
          user_email: users.email,
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.taskId, taskId))
        .orderBy(desc(comments.createdAt));

      console.log("✅ CommentsRepo findByTaskId - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ CommentsRepo findByTaskId error:", error);
      throw error;
    }
  }
}
