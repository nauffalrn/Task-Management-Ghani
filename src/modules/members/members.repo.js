import { db } from "../../config/db.js";
import {
  workspacesMembers,
  users,
  workspaces,
} from "../../../drizzle/schema.js";
import { eq, and } from "drizzle-orm";

export class MembersRepository {
  async findByWorkspaceId(workspaceId) {
    const result = await db
      .select({
        id: workspacesMembers.id,
        userId: workspacesMembers.userId,
        userName: users.name,
        userRole: users.role,
        workspaceRole: workspacesMembers.role,
        createdAt: workspacesMembers.createdAt,
        updatedAt: workspacesMembers.updatedAt,
      })
      .from(workspacesMembers)
      .innerJoin(users, eq(workspacesMembers.userId, users.id))
      .where(eq(workspacesMembers.workspaceId, workspaceId));

    return result;
  }

  async findMember(workspaceId, userId) {
    const result = await db
      .select()
      .from(workspacesMembers)
      .where(
        and(
          eq(workspacesMembers.workspaceId, workspaceId),
          eq(workspacesMembers.userId, userId)
        )
      );
    return result[0] || null;
  }

  async addMember(memberData) {
    const result = await db
      .insert(workspacesMembers)
      .values(memberData)
      .returning();
    return result[0];
  }

  async updateMember(id, memberData) {
    const updateData = {
      ...memberData,
      updatedAt: new Date(),
    };

    const result = await db
      .update(workspacesMembers)
      .set(updateData)
      .where(eq(workspacesMembers.id, id))
      .returning();
    return result[0] || null;
  }

  async removeMember(id) {
    const result = await db
      .delete(workspacesMembers)
      .where(eq(workspacesMembers.id, id))
      .returning();
    return result[0] || null;
  }

  async removeMemberByIds(workspaceId, userId) {
    const result = await db
      .delete(workspacesMembers)
      .where(
        and(
          eq(workspacesMembers.workspaceId, workspaceId),
          eq(workspacesMembers.userId, userId)
        )
      )
      .returning();
    return result[0] || null;
  }
}
