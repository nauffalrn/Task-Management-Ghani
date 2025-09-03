import { BaseRepository } from "../../common/repository/base.repository.js";
import { logs, users, workspaces, tasks } from "../../../drizzle/schema.js";
import { eq, desc, and } from "drizzle-orm";

export class LogsRepository extends BaseRepository {
  constructor() {
    super(logs, "log");
  }

  async findAll(filters = {}) {
    try {
      let query = this.db
        .select({
          id: logs.id,
          workspaceId: logs.workspaceId,
          workspaceName: workspaces.name,
          taskId: logs.taskId,
          taskTitle: tasks.title,
          userId: logs.userId,
          userName: users.name,
          action: logs.action,
          createdAt: logs.createdAt,
        })
        .from(logs)
        .innerJoin(users, eq(logs.userId, users.id))
        .innerJoin(workspaces, eq(logs.workspaceId, workspaces.id))
        .leftJoin(tasks, eq(logs.taskId, tasks.id))
        .orderBy(desc(logs.createdAt));

      // Apply filters
      const conditions = [];

      if (filters.workspaceId) {
        conditions.push(eq(logs.workspaceId, filters.workspaceId));
      }

      if (filters.userId) {
        conditions.push(eq(logs.userId, filters.userId));
      }

      if (filters.taskId) {
        conditions.push(eq(logs.taskId, filters.taskId));
      }

      if (filters.action) {
        conditions.push(eq(logs.action, filters.action));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return await query;
    } catch (error) {
      throw new Error(`Failed to find logs: ${error.message}`);
    }
  }

  async findByWorkspaceId(workspaceId) {
    try {
      const result = await this.db
        .select({
          id: logs.id,
          workspaceId: logs.workspaceId,
          taskId: logs.taskId,
          taskTitle: tasks.title,
          userId: logs.userId,
          userName: users.name,
          action: logs.action,
          createdAt: logs.createdAt,
        })
        .from(logs)
        .innerJoin(users, eq(logs.userId, users.id))
        .leftJoin(tasks, eq(logs.taskId, tasks.id))
        .where(eq(logs.workspaceId, workspaceId))
        .orderBy(desc(logs.createdAt));

      return result;
    } catch (error) {
      throw new Error(`Failed to find logs by workspace ID: ${error.message}`);
    }
  }

  async findByUserId(userId) {
    try {
      const result = await this.db
        .select()
        .from(logs)
        .where(eq(logs.userId, userId))
        .orderBy(desc(logs.createdAt));
      return result;
    } catch (error) {
      throw new Error(`Failed to find logs by user ID: ${error.message}`);
    }
  }
}
