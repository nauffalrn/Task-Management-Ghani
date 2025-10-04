import { db } from "./db.js";
import { users } from "../../drizzle/schema.js";
import { desc } from "drizzle-orm";

export const testDatabaseConnection = async () => {
  try {
    console.log("🧪 Testing database connection...");

    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || "5432",
      user: process.env.DB_USER || "postgres",
      database: process.env.DB_NAME || "task_management_db",
      passwordSet: !!process.env.DB_PASSWORD,
    };

    console.log("🔍 DB config:", dbConfig);

    // PERBAIKAN: Gunakan Drizzle ORM untuk test query
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(3);

    console.log("✅ Database connected successfully!");
    console.log("⏰ Current time:", new Date().toISOString());
    console.log("👥 Users in database:", result.length);
    console.log("👤 Sample users:", result);

    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log(
      "💡 Check if PostgreSQL is running and credentials are correct"
    );
    return false;
  }
};
