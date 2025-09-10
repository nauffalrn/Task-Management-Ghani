import { db } from "../../config/db.js";

export class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = db;
  }

  async findById(id) {
    try {
      console.log("🔍 BaseRepo findById - DB type:", typeof this.db);
      console.log("🔍 BaseRepo findById - DB query:", typeof this.db.query);

      const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      const result = await this.db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("❌ BaseRepo findById error:", error);
      throw new Error(
        `Failed to find ${this.tableName} by id: ${error.message}`
      );
    }
  }

  async create(data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");

      const query = `
        INSERT INTO ${this.tableName} (${keys.join(", ")})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");

      const query = `
        UPDATE ${this.tableName}
        SET ${setClause}
        WHERE id = $${keys.length + 1}
        RETURNING *
      `;

      const result = await this.db.query(query, [...values, id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`;
      const result = await this.db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
    }
  }
}
