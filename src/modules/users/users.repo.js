import { BaseRepository } from "../../common/repository/base.repository.js";
import { db } from "../../config/db.js";

export class UsersRepository extends BaseRepository {
  constructor() {
    super("users");
    // Override db connection untuk memastikan
    this.db = db;
  }

  async findByEmail(email) {
    try {
      console.log("🔍 UsersRepo findByEmail - Finding user with email:", email);
      console.log("🔍 UsersRepo findByEmail - DB type:", typeof this.db);
      console.log(
        "🔍 UsersRepo findByEmail - DB query method:",
        typeof this.db.query
      );

      const query = `
        SELECT id, name, email, password, role, created_at, updated_at 
        FROM users 
        WHERE email = $1 
        LIMIT 1
      `;

      console.log("📝 Query:", query);
      console.log("📋 Params:", [email]);

      const result = await this.db.query(query, [email]);

      console.log("✅ Query result:", result.rows);

      return result.rows[0] || null;
    } catch (error) {
      console.error("❌ UsersRepo findByEmail error:", error);
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const query = `
        SELECT id, name, email, password, role, created_at, updated_at 
        FROM users 
        WHERE id = $1 
        LIMIT 1
      `;

      const result = await this.db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to find user by id: ${error.message}`);
    }
  }

  async create(userData) {
    try {
      const query = `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at, updated_at
      `;

      const values = [
        userData.name,
        userData.email,
        userData.password,
        userData.role || "staff_it",
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async update(id, userData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (userData.name) {
        fields.push(`name = $${paramCount}`);
        values.push(userData.name);
        paramCount++;
      }

      if (userData.email) {
        fields.push(`email = $${paramCount}`);
        values.push(userData.email);
        paramCount++;
      }

      if (userData.password) {
        fields.push(`password = $${paramCount}`);
        values.push(userData.password);
        paramCount++;
      }

      if (userData.role) {
        fields.push(`role = $${paramCount}`);
        values.push(userData.role);
        paramCount++;
      }

      if (fields.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(id);
      const query = `
        UPDATE users 
        SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING id, name, email, role, created_at, updated_at
      `;

      const result = await this.db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const query = "DELETE FROM users WHERE id = $1 RETURNING id";
      const result = await this.db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async getAll({ limit = 10, offset = 0, search = "" } = {}) {
    try {
      let whereClause = "";
      let values = [];
      let paramCount = 1;

      if (search) {
        whereClause = `WHERE name ILIKE $${paramCount} OR email ILIKE $${paramCount}`;
        values.push(`%${search}%`);
        paramCount++;
      }

      const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
      const countResult = await this.db.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      values.push(limit, offset);
      const dataQuery = `
        SELECT id, name, email, role, created_at, updated_at 
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      const dataResult = await this.db.query(dataQuery, values);

      return {
        data: dataResult.rows,
        total,
      };
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }
}
