import { db } from "../../config/db.js";
import {
  tasks,
  users,
  workspaces,
  workspacesMembers,
} from "../../../drizzle/schema.js";
import { eq, like, or, and, isNull } from "drizzle-orm";

export class TasksRepository {
  async findAll(filters = {}) {
    let query = db
      .select({
        id: tasks.id,
        workspaceId: tasks.workspaceId,
        workspaceName: workspaces.name,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        assignTo: tasks.assignTo,
        assigneeName: users.name,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignTo, users.id))
      .leftJoin(workspaces, eq(tasks.workspaceId, workspaces.id));

    // Apply filters
    const conditions = [];

    if (filters.workspaceId) {
      conditions.push(eq(tasks.workspaceId, filters.workspaceId));
    }

    if (filters.status) {
      conditions.push(eq(tasks.status, filters.status));
    }

    if (filters.assignTo) {
      conditions.push(eq(tasks.assignTo, filters.assignTo));
    }

    if (filters.search) {
      conditions.push(
        or(
          like(tasks.title, `%${filters.search}%`),
          like(tasks.description, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async findById(id) {
    const result = await db
      .select({
        id: tasks.id,
        workspaceId: tasks.workspaceId,
        workspaceName: workspaces.name,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        assignTo: tasks.assignTo,
        assigneeName: users.name,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignTo, users.id))
      .leftJoin(workspaces, eq(tasks.workspaceId, workspaces.id))
      .where(eq(tasks.id, id));

    return result[0] || null;
  }

  async findByWorkspaceId(workspaceId) {
    const result = await db
      .select({
        id: tasks.id,
        workspaceId: tasks.workspaceId,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        assignTo: tasks.assignTo,
        assigneeName: users.name,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignTo, users.id))
      .where(eq(tasks.workspaceId, workspaceId));

    return result;
  }

  async findByAssignee(userId) {
    const result = await db
      .select({
        id: tasks.id,
        workspaceId: tasks.workspaceId,
        workspaceName: workspaces.name,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        assignTo: tasks.assignTo,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .leftJoin(workspaces, eq(tasks.workspaceId, workspaces.id))
      .where(eq(tasks.assignTo, userId));

    return result;
  }

  async create(taskData) {
    const result = await db.insert(tasks).values(taskData).returning();
    return result[0];
  }

  async update(id, taskData) {
    const updateData = {
      ...taskData,
      updatedAt: new Date(),
    };

    const result = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id) {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result[0] || null;
  }
}
