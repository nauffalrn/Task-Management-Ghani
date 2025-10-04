import { db } from "../../config/db.js";
import { eq } from "drizzle-orm"; // TAMBAH: Import eq yang hilang

export class BaseRepository {
  constructor(table) {
    this.table = table;
    this.db = db; // PERBAIKAN: Gunakan db instance yang benar
  }

  async findById(id) {
    try {
      console.log(`🔍 BaseRepository findById - ID: ${id}`);

      // PERBAIKAN: Gunakan Drizzle ORM dengan benar
      const result = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table.id, id))
        .limit(1);

      console.log(
        "✅ BaseRepository findById - Result:",
        result.length > 0 ? "Found" : "Not found"
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("❌ BaseRepository findById error:", error);
      throw error;
    }
  }

  async create(data) {
    try {
      console.log("📝 BaseRepository create - Data:", data);

      const result = await this.db.insert(this.table).values(data).returning();

      console.log("✅ BaseRepository create - Created:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ BaseRepository create error:", error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      console.log("🔄 BaseRepository update - ID:", id, "Data:", data);

      const result = await this.db
        .update(this.table)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(this.table.id, id))
        .returning();

      console.log("✅ BaseRepository update - Updated:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ BaseRepository update error:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      console.log("🗑️ BaseRepository delete - ID:", id);

      const result = await this.db
        .delete(this.table)
        .where(eq(this.table.id, id))
        .returning();

      console.log("✅ BaseRepository delete - Deleted:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("❌ BaseRepository delete error:", error);
      throw error;
    }
  }

  async findAll(options = {}) {
    try {
      const { limit = 10, offset = 0 } = options;

      console.log("🔍 BaseRepository findAll - Options:", options);

      const result = await this.db
        .select()
        .from(this.table)
        .limit(limit)
        .offset(offset);

      console.log("✅ BaseRepository findAll - Found:", result.length);
      return result;
    } catch (error) {
      console.error("❌ BaseRepository findAll error:", error);
      throw error;
    }
  }
}
