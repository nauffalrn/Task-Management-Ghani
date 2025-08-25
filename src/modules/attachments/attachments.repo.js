import { db } from "../../config/db.js";
import { attachments, users, tasks } from "../../../drizzle/schema.js";
import { eq, desc } from "drizzle-orm";

export class AttachmentsRepository {
  async findByTaskId(taskId) {
    const result = await db
      .select({
        id: attachments.id,
        taskId: attachments.taskId,
        userId: attachments.userId,
        userName: users.name,
        fileName: attachments.fileName,
        fileType: attachments.fileType,
        cloudinaryUrl: attachments.cloudinaryUrl,
        createdAt: attachments.createdAt,
        updatedAt: attachments.updatedAt,
      })
      .from(attachments)
      .innerJoin(users, eq(attachments.userId, users.id))
      .where(eq(attachments.taskId, taskId))
      .orderBy(desc(attachments.createdAt));

    return result;
  }

  async findById(id) {
    const result = await db
      .select({
        id: attachments.id,
        taskId: attachments.taskId,
        userId: attachments.userId,
        userName: users.name,
        fileName: attachments.fileName,
        fileType: attachments.fileType,
        cloudinaryUrl: attachments.cloudinaryUrl,
        createdAt: attachments.createdAt,
        updatedAt: attachments.updatedAt,
      })
      .from(attachments)
      .innerJoin(users, eq(attachments.userId, users.id))
      .where(eq(attachments.id, id));

    return result[0] || null;
  }

  async create(attachmentData) {
    const result = await db
      .insert(attachments)
      .values(attachmentData)
      .returning();
    return result[0];
  }

  async delete(id) {
    const result = await db
      .delete(attachments)
      .where(eq(attachments.id, id))
      .returning();
    return result[0] || null;
  }
}
