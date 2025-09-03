import { BaseRepository } from "../../common/repository/base.repository.js";
import { db } from "../../config/db.js";
import { tasks, users, workspaces } from "../../../drizzle/schema.js";
import { eq, and, ilike, count } from "drizzle-orm";

export class TasksRepository extends BaseRepository {
  constructor() {
    super(tasks, "task");
  }

  async findAll(options = {}) {
    return super.findAll({
      ...options,
      searchField: "title",
      additionalConditions: this.buildAdditionalConditions(options),
    });
  }

  buildAdditionalConditions(options) {
    const conditions = [];

    if (options.workspaceId) {
      conditions.push(eq(tasks.workspaceId, options.workspaceId));
    }

    if (options.status) {
      conditions.push(eq(tasks.status, options.status));
    }

    if (options.priority) {
      conditions.push(eq(tasks.priority, options.priority));
    }

    if (options.assignedTo) {
      conditions.push(eq(tasks.assignedTo, options.assignedTo));
    }

    return conditions.length > 0 ? and(...conditions) : null;
  }

  async findByWorkspaceId(workspaceId, options = {}) {
    return this.findAll({
      ...options,
      workspaceId,
    });
  }

  async findByAssignedUser(userId, options = {}) {
    return this.findAll({
      ...options,
      assignedTo: userId,
    });
  }

  async findWithDetails(taskId) {
    try {
      const result = await db
        .select({
          id: tasks.id,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          priority: tasks.priority,
          dueDate: tasks.dueDate,
          createdAt: tasks.createdAt,
          updatedAt: tasks.updatedAt,
          workspace: {
            id: workspaces.id,
            name: workspaces.name,
          },
          creator: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
          assignee: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(tasks)
        .leftJoin(workspaces, eq(tasks.workspaceId, workspaces.id))
        .leftJoin(users, eq(tasks.createdBy, users.id))
        .leftJoin(users, eq(tasks.assignedTo, users.id))
        .where(eq(tasks.id, taskId));

      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to find task with details: ${error.message}`);
    }
  }

  async countByStatus(workspaceId = null) {
    try {
      let query = db
        .select({
          status: tasks.status,
          count: count(),
        })
        .from(tasks)
        .groupBy(tasks.status);

      if (workspaceId) {
        query = query.where(eq(tasks.workspaceId, workspaceId));
      }

      return await query;
    } catch (error) {
      throw new Error(`Failed to count tasks by status: ${error.message}`);
    }
  }
}
