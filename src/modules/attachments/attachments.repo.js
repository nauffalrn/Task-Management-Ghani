import { BaseRepository } from "../../common/repository/base.repository.js";
import { attachments } from "../../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export class AttachmentsRepository extends BaseRepository {
  constructor() {
    super(attachments, "attachment");
  }

  async findByTaskId(taskId) {
    try {
      const result = await this.db
        .select()
        .from(attachments)
        .where(eq(attachments.taskId, taskId))
        .orderBy(attachments.createdAt);
      return result;
    } catch (error) {
      throw new Error(
        `Failed to find attachments by task ID: ${error.message}`
      );
    }
  }

  async findByUserId(userId) {
    try {
      const result = await this.db
        .select()
        .from(attachments)
        .where(eq(attachments.userId, userId))
        .orderBy(attachments.createdAt);
      return result;
    } catch (error) {
      throw new Error(
        `Failed to find attachments by user ID: ${error.message}`
      );
    }
  }
}
