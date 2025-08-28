import { db } from "../../config/db.js";
import { attachments } from "../../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export class AttachmentsRepository {
  async create(attachmentData) {
    const [attachment] = await db
      .insert(attachments)
      .values(attachmentData)
      .returning();
    return attachment;
  }

  async findById(id) {
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, id));
    return attachment;
  }

  async findByTaskId(taskId) {
    return await db
      .select()
      .from(attachments)
      .where(eq(attachments.taskId, taskId))
      .orderBy(attachments.createdAt);
  }

  async delete(id) {
    await db.delete(attachments).where(eq(attachments.id, id));
  }

  async update(id, updateData) {
    const [updatedAttachment] = await db
      .update(attachments)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(attachments.id, id))
      .returning();
    return updatedAttachment;
  }
}
