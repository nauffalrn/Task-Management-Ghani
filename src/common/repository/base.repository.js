import { eq, ilike, count, and } from "drizzle-orm";
import { db } from "../../config/db.js";
import { PAGINATION } from "../constants/app.js";

export class BaseRepository {
  constructor(table, entityName = "record") {
    this.table = table;
    this.entityName = entityName;
    this.db = db;
  }

  async findById(id) {
    try {
      const result = await this.db.select().from(this.table).where(eq(this.table.id, id));
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to find ${this.entityName} by ID: ${error.message}`);
    }
  }

  async findAll({ 
    limit = PAGINATION.DEFAULT_LIMIT, 
    offset = PAGINATION.DEFAULT_OFFSET, 
    search = "", 
    searchField = null,
    additionalConditions = null 
  } = {}) {
    try {
      let query = this.db.select().from(this.table);
      let countQuery = this.db.select({ count: count() }).from(this.table);

      const conditions = [];

      // Search condition
      if (search && searchField) {
        conditions.push(ilike(this.table[searchField], `%${search}%`));
      }

      // Additional conditions
      if (additionalConditions) {
        conditions.push(additionalConditions);
      }

      // Apply conditions
      if (conditions.length > 0) {
        const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
        query = query.where(whereCondition);
        countQuery = countQuery.where(whereCondition);
      }

      const [results, countResult] = await Promise.all([
        query.limit(limit).offset(offset),
        countQuery,
      ]);

      return {
        data: results,
        total: countResult[0].count,
      };
    } catch (error) {
      throw new Error(`Failed to fetch ${this.entityName}s: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const result = await this.db.insert(this.table).values(data).returning();
      return result[0];
    } catch (error) {
      throw new Error(`Failed to create ${this.entityName}: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const result = await this.db
        .update(this.table)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(this.table.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to update ${this.entityName}: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const result = await this.db
        .delete(this.table)
        .where(eq(this.table.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to delete ${this.entityName}: ${error.message}`);
    }
  }

  async findByCondition(condition) {
    try {
      const result = await this.db.select().from(this.table).where(condition);
      return result;
    } catch (error) {
      throw new Error(`Failed to find ${this.entityName}s by condition: ${error.message}`);
    }
  }

  async findOneByCondition(condition) {
    try {
      const result = await this.db.select().from(this.table).where(condition);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to find ${this.entityName} by condition: ${error.message}`);
    }
  }

  async createMany(dataArray) {
    try {
      const result = await this.db.insert(this.table).values(dataArray).returning();
      return result;
    } catch (error) {
      throw new Error(`Failed to create multiple ${this.entityName}s: ${error.message}`);
    }
  }

  async countByCondition(condition) {
    try {
      const result = await this.db.select({ count: count() }).from(this.table).where(condition);
      return result[0].count;
    } catch (error) {
      throw new Error(`Failed to count ${this.entityName}s: ${error.message}`);
    }
  }
}