import { BaseRepository } from "../../common/repository/base.repository.js";
import { users } from "../../../drizzle/schema.js";
import { eq, like, or, and, desc } from "drizzle-orm";

export class UsersRepository extends BaseRepository {
  constructor() {
    super(users);
  }

  // PERBAIKAN: Method findMany dengan Drizzle ORM yang benar
  async findMany(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        role,
        excludeFields = [],
      } = options;

      console.log("🔍 UsersRepo findMany - Options:", options);

      const offset = (page - 1) * limit;

      // Build where conditions
      let whereConditions = [];

      if (search) {
        whereConditions.push(
          or(like(users.name, `%${search}%`), like(users.email, `%${search}%`))
        );
      }

      if (role) {
        whereConditions.push(eq(users.role, role));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // PERBAIKAN: Build select fields dengan benar
      const selectFields = {};

      // Define all available fields
      const fieldMapping = {
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
        role: users.role,
        created_at: users.createdAt,
        updated_at: users.updatedAt,
      };

      // Include fields that are not excluded
      Object.keys(fieldMapping).forEach((field) => {
        if (!excludeFields.includes(field)) {
          selectFields[field] = fieldMapping[field];
        }
      });

      console.log("🔍 Select fields:", Object.keys(selectFields));

      // PERBAIKAN: Build query dengan Drizzle ORM
      let query = this.db
        .select(selectFields)
        .from(users)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(users.createdAt));

      if (whereClause) {
        query = query.where(whereClause);
      }

      console.log("📝 Executing query...");
      const result = await query;

      console.log("✅ UsersRepo findMany - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ UsersRepo findMany error:", error);
      throw error;
    }
  }

  // PERBAIKAN: Find user by email dengan Drizzle ORM
  async findByEmail(email) {
    try {
      console.log("🔍 UsersRepo findByEmail - Finding user with email:", email);

      const result = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      console.log("✅ Query result length:", result.length);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("❌ Database query error:", error);
      throw error;
    }
  }

  // PERBAIKAN: Search users dengan Drizzle ORM
  async searchUsers(query, options = {}) {
    try {
      const { limit = 10 } = options;

      console.log("🔍 UsersRepo searchUsers - Query:", query);

      const result = await this.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          created_at: users.createdAt,
          updated_at: users.updatedAt,
        })
        .from(users)
        .where(
          or(like(users.name, `%${query}%`), like(users.email, `%${query}%`))
        )
        .limit(limit)
        .orderBy(desc(users.createdAt));

      console.log("✅ UsersRepo searchUsers - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ UsersRepo searchUsers error:", error);
      throw error;
    }
  }
}
