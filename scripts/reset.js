import { db } from "../src/config/db.js";

async function resetDatabase() {
  try {
    console.log("🗑️ Resetting database...");

    // Drop tables in correct order (reverse of creation order)
    const dropQueries = [
      "DROP TABLE IF EXISTS logs CASCADE;",
      "DROP TABLE IF EXISTS attachments CASCADE;",
      "DROP TABLE IF EXISTS comments CASCADE;",
      "DROP TABLE IF EXISTS tasks CASCADE;",
      "DROP TABLE IF EXISTS workspaces_members CASCADE;",
      "DROP TABLE IF EXISTS workspaces CASCADE;",
      "DROP TABLE IF EXISTS users CASCADE;",
      "DROP TYPE IF EXISTS task_status CASCADE;",
    ];

    for (const query of dropQueries) {
      await db.query(query);
      console.log(`✅ Executed: ${query}`);
    }

    console.log("🎉 Database reset completed!");
    console.log("💡 Now run: npm run seed");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  }
}

resetDatabase()
  .then(() => {
    console.log("Reset finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Reset failed:", error);
    process.exit(1);
  });
