import { BaseRepository } from "../../common/repository/base.repository.js";
import { attachments, users, tasks } from "../../../drizzle/schema.js";
import { eq, like, or, and, desc } from "drizzle-orm";

export class AttachmentsRepository extends BaseRepository {
  constructor() {
    super(attachments);

    // Debug: Check if attachments schema is properly imported
    console.log(
      "🔍 AttachmentsRepo constructor - attachments schema:",
      !!attachments
    );
    console.log(
      "🔍 AttachmentsRepo constructor - attachments fields:",
      attachments ? Object.keys(attachments) : "undefined"
    );
  }

  // Get all attachments with pagination and search
  async findMany(options = {}) {
    try {
      const { page = 1, limit = 10, taskId } = options;

      console.log("🔍 AttachmentsRepo findMany - Options:", options);

      // Check if attachments table is defined
      if (!attachments) {
        console.error("❌ Attachments table schema is undefined!");
        throw new Error("Attachments table schema is not properly imported");
      }

      const offset = (page - 1) * limit;

      // Build where conditions
      let whereConditions = [];

      if (taskId) {
        whereConditions.push(eq(attachments.taskId, taskId));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Simple query first without joins to test
      let query = this.db
        .select()
        .from(attachments)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(attachments.createdAt));

      if (whereClause) {
        query = query.where(whereClause);
      }

      console.log("📝 Executing attachments query...");
      const result = await query;

      console.log("✅ AttachmentsRepo findMany - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ AttachmentsRepo findMany error:", error);
      throw error;
    }
  }

  // Find attachment by ID
  async findById(id) {
    try {
      console.log("🔍 AttachmentsRepo findById - ID:", id);

      if (!attachments) {
        console.error("❌ Attachments table schema is undefined!");
        throw new Error("Attachments table schema is not properly imported");
      }

      const result = await this.db
        .select()
        .from(attachments)
        .where(eq(attachments.id, id))
        .limit(1);

      console.log(
        "✅ AttachmentsRepo findById - Found:",
        result.length > 0 ? "Yes" : "No"
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("❌ AttachmentsRepo findById error:", error);
      throw error;
    }
  }

  // Create attachment
  async create(data) {
    try {
      console.log("📝 AttachmentsRepo create - Data:", data);

      if (!attachments) {
        throw new Error("Attachments table schema is not properly imported");
      }

      const result = await this.db.insert(attachments).values(data).returning();

      console.log("✅ AttachmentsRepo create - Created:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ AttachmentsRepo create error:", error);
      throw error;
    }
  }

  // Delete attachment
  async delete(id) {
    try {
      console.log("🗑️ AttachmentsRepo delete - ID:", id);

      if (!attachments) {
        throw new Error("Attachments table schema is not properly imported");
      }

      const result = await this.db
        .delete(attachments)
        .where(eq(attachments.id, id))
        .returning();

      console.log("✅ AttachmentsRepo delete - Deleted:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ AttachmentsRepo delete error:", error);
      throw error;
    }
  }

  // Get attachments by task ID
  async findByTaskId(taskId) {
    try {
      console.log("🔍 AttachmentsRepo findByTaskId - TaskId:", taskId);

      if (!attachments) {
        throw new Error("Attachments table schema is not properly imported");
      }

      const result = await this.db
        .select()
        .from(attachments)
        .where(eq(attachments.taskId, taskId))
        .orderBy(desc(attachments.createdAt));

      console.log("✅ AttachmentsRepo findByTaskId - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ AttachmentsRepo findByTaskId error:", error);
      throw error;
    }
  }
}
