import { db } from "./db.js";

async function testConnection() {
  try {
    console.log("🧪 Testing database connection...");
    console.log("🔍 DB config:", {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      passwordSet: !!process.env.DB_PASSWORD,
    });

    const result = await db.query("SELECT NOW() as current_time");
    console.log("✅ Database connected successfully!");
    console.log("⏰ Current time:", result.rows[0].current_time);

    // Check if users table exists
    try {
      const tableCheck = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);

      if (tableCheck.rows[0].exists) {
        const usersTest = await db.query(
          "SELECT COUNT(*) as user_count FROM users"
        );
        console.log("👥 Users in database:", usersTest.rows[0].user_count);

        // Show sample users
        const sampleUsers = await db.query(
          "SELECT id, name, email, role FROM users LIMIT 3"
        );
        console.log("👤 Sample users:", sampleUsers.rows);
      } else {
        console.log("⚠️ Users table does not exist. Need to run migrations.");
      }
    } catch (tableError) {
      console.log("⚠️ Could not check users table:", tableError.message);
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error(
      "💡 Check if PostgreSQL is running and credentials are correct"
    );
  }
}

export { testConnection };
