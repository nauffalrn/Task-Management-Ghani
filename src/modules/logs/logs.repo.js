import { db } from "../../config/db.js";
import { logs, users, workspaces, tasks } from "../../../drizzle/schema.js";
import { eq, desc, and } from "drizzle-orm";

export class LogsRepository {
  async findAll(filters = {}) {
    let query = db
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

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async findByWorkspaceId(workspaceId) {
    const result = await db
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
  }

  async create(logData) {
    const result = await db.insert(logs).values(logData).returning();
    return result[0];
  }
}
