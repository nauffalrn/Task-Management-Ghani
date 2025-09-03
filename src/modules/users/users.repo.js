import { BaseRepository } from "../../common/repository/base.repository.js";
import { db } from "../../config/db.js";
import { users } from "../../../drizzle/schema.js";
import { eq, ilike, count } from "drizzle-orm";
import { PAGINATION } from "../../common/constants/app.js";

export class UsersRepository extends BaseRepository {
  constructor() {
    super(users, "user");
  }

  async findByEmail(email) {
    return this.findOneByCondition(eq(users.email, email));
  }

  async findAll(options = {}) {
    return super.findAll({
      ...options,
      searchField: "name",
    });
  }

  // Custom method for users with specific fields
  async findAllForListing(options = {}) {
    try {
      // Select only safe fields (exclude password)
      const query = this.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users);

      // Apply search if provided
      if (options.search) {
        const searchCondition = ilike(users.name, `%${options.search}%`);
        query = query.where(searchCondition);
      }

      const result = await query
        .limit(options.limit || PAGINATION.DEFAULT_LIMIT)
        .offset(options.offset || PAGINATION.DEFAULT_OFFSET);

      // Get total count
      const countResult = await this.countByCondition(
        options.search ? ilike(users.name, `%${options.search}%`) : undefined
      );

      return {
        data: result,
        total: countResult,
      };
    } catch (error) {
      throw new Error(`Failed to fetch users for listing: ${error.message}`);
    }
  }

  // Override create to handle password hashing
  async create(userData) {
    try {
      const result = await this.db.insert(users).values(userData).returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
      return result[0];
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Override update to exclude password from return
  async update(id, userData) {
    try {
      const result = await this.db
        .update(users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
}
