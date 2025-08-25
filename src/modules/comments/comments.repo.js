import { db } from "../../config/db.js";
import { comments, users, tasks } from "../../../drizzle/schema.js";
import { eq, desc } from "drizzle-orm";

export class CommentsRepository {
  async findByTaskId(taskId) {
    const result = await db
      .select({
        id: comments.id,
        taskId: comments.taskId,
        userId: comments.userId,
        userName: users.name,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.taskId, taskId))
      .orderBy(desc(comments.createdAt));

    return result;
  }

  async findById(id) {
    const result = await db
      .select({
        id: comments.id,
        taskId: comments.taskId,
        userId: comments.userId,
        userName: users.name,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, id));

    return result[0] || null;
  }

  async create(commentData) {
    const result = await db.insert(comments).values(commentData).returning();
    return result[0];
  }

  async update(id, commentData) {
    const updateData = {
      ...commentData,
      updatedAt: new Date(),
    };

    const result = await db
      .update(comments)
      .set(updateData)
      .where(eq(comments.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id) {
    const result = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning();
    return result[0] || null;
  }
}
