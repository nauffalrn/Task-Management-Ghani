import { BaseRepository } from "../../common/repository/base.repository.js";
import { logs, users, workspaces } from "../../../drizzle/schema.js";
import { eq, like, or, and, desc } from "drizzle-orm";

export class LogsRepository extends BaseRepository {
  constructor() {
    super(logs);

    // Debug: Check if logs schema is properly imported
    console.log("🔍 LogsRepo constructor - logs schema:", !!logs);
    console.log(
      "🔍 LogsRepo constructor - logs fields:",
      logs ? Object.keys(logs) : "undefined"
    );
  }

  // Get all logs with pagination and search
  async findMany(options = {}) {
    try {
      const { page = 1, limit = 10, workspaceId, action } = options;

      console.log("🔍 LogsRepo findMany - Options:", options);

      // Check if logs table is defined
      if (!logs) {
        console.error("❌ Logs table schema is undefined!");
        throw new Error("Logs table schema is not properly imported");
      }

      const offset = (page - 1) * limit;

      // Build where conditions
      let whereConditions = [];

      if (workspaceId) {
        whereConditions.push(eq(logs.workspaceId, workspaceId));
      }

      if (action) {
        whereConditions.push(eq(logs.action, action));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Simple query first without joins to test
      let query = this.db
        .select()
        .from(logs)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(logs.createdAt));

      if (whereClause) {
        query = query.where(whereClause);
      }

      console.log("📝 Executing logs query...");
      const result = await query;

      console.log("✅ LogsRepo findMany - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ LogsRepo findMany error:", error);
      throw error;
    }
  }

  // Find log by ID
  async findById(id) {
    try {
      console.log("🔍 LogsRepo findById - ID:", id);

      // Check if logs table is defined
      if (!logs) {
        console.error("❌ Logs table schema is undefined!");
        throw new Error("Logs table schema is not properly imported");
      }

      const result = await this.db
        .select()
        .from(logs)
        .where(eq(logs.id, id))
        .limit(1);

      console.log(
        "✅ LogsRepo findById - Found:",
        result.length > 0 ? "Yes" : "No"
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("❌ LogsRepo findById error:", error);
      throw error;
    }
  }

  // Create log
  async create(data) {
    try {
      console.log("📝 LogsRepo create - Data:", data);

      if (!logs) {
        console.error("❌ Logs table schema is undefined!");
        throw new Error("Logs table schema is not properly imported");
      }

      const result = await this.db.insert(logs).values(data).returning();

      console.log("✅ LogsRepo create - Created:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ LogsRepo create error:", error);
      throw error;
    }
  }

  // Get logs by workspace ID
  async findByWorkspaceId(workspaceId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      console.log("🔍 LogsRepo findByWorkspaceId - WorkspaceId:", workspaceId);

      if (!logs) {
        throw new Error("Logs table schema is not properly imported");
      }

      const result = await this.db
        .select()
        .from(logs)
        .where(eq(logs.workspaceId, workspaceId))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(logs.createdAt));

      console.log("✅ LogsRepo findByWorkspaceId - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ LogsRepo findByWorkspaceId error:", error);
      throw error;
    }
  }

  // Get logs by user ID
  async findByUserId(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      console.log("🔍 LogsRepo findByUserId - UserId:", userId);

      if (!logs) {
        throw new Error("Logs table schema is not properly imported");
      }

      const result = await this.db
        .select()
        .from(logs)
        .where(eq(logs.userId, userId))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(logs.createdAt));

      console.log("✅ LogsRepo findByUserId - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ LogsRepo findByUserId error:", error);
      throw error;
    }
  }
}
