import { BaseRepository } from "../../common/repository/base.repository.js";
import { comments, users } from "../../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export class CommentsRepository extends BaseRepository {
  constructor() {
    super(comments, "comment");
  }

  async findByTaskId(taskId, options = {}) {
    return this.findAll({
      ...options,
      additionalConditions: eq(comments.taskId, taskId),
    });
  }

  async findWithUser(commentId) {
    try {
      const result = await this.db
        .select({
          id: comments.id,
          content: comments.content,
          createdAt: comments.createdAt,
          updatedAt: comments.updatedAt,
          taskId: comments.taskId,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.id, commentId));

      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to find comment with user: ${error.message}`);
    }
  }
}
