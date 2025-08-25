import { db } from "../../config/db.js";
import { users } from "../../../drizzle/schema.js";
import { eq, like, or } from "drizzle-orm";

export class UsersRepository {
  async findAll(search = "") {
    let query = db.select().from(users);

    if (search) {
      query = query.where(
        or(like(users.name, `%${search}%`), like(users.role, `%${search}%`))
      );
    }

    return await query;
  }

  async findById(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async findByName(name) {
    const result = await db.select().from(users).where(eq(users.name, name));
    return result[0] || null;
  }

  async create(userData) {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async update(id, userData) {
    const result = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id) {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result[0] || null;
  }
}
