import { db } from "../../config/db.js";
import {
  workspaces,
  workspacesMembers,
  users,
} from "../../../drizzle/schema.js";
import { eq, like, or, and } from "drizzle-orm";

export class WorkspacesRepository {
  async findAll(search = "") {
    let query = db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        description: workspaces.description,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt,
      })
      .from(workspaces);

    if (search) {
      query = query.where(
        or(
          like(workspaces.name, `%${search}%`),
          like(workspaces.description, `%${search}%`)
        )
      );
    }

    return await query;
  }

  async findById(id) {
    const result = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));
    return result[0] || null;
  }

  async findByUserId(userId) {
    const result = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        description: workspaces.description,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt,
        userRole: workspacesMembers.role,
      })
      .from(workspaces)
      .innerJoin(
        workspacesMembers,
        eq(workspaces.id, workspacesMembers.workspaceId)
      )
      .where(eq(workspacesMembers.userId, userId));

    return result;
  }

  async create(workspaceData) {
    const result = await db
      .insert(workspaces)
      .values(workspaceData)
      .returning();
    return result[0];
  }

  async update(id, workspaceData) {
    const updateData = {
      ...workspaceData,
      updatedAt: new Date(),
    };

    const result = await db
      .update(workspaces)
      .set(updateData)
      .where(eq(workspaces.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id) {
    const result = await db
      .delete(workspaces)
      .where(eq(workspaces.id, id))
      .returning();
    return result[0] || null;
  }

  async getWorkspaceMembers(workspaceId) {
    const result = await db
      .select({
        id: workspacesMembers.id,
        userId: workspacesMembers.userId,
        userName: users.name,
        userRole: users.role,
        workspaceRole: workspacesMembers.role,
        createdAt: workspacesMembers.createdAt,
      })
      .from(workspacesMembers)
      .innerJoin(users, eq(workspacesMembers.userId, users.id))
      .where(eq(workspacesMembers.workspaceId, workspaceId));

    return result;
  }
}
