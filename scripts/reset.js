import { db } from "../src/config/db.js";
import {
  users,
  workspaces,
  workspacesMembers,
  tasks,
  comments,
  attachments,
  logs,
} from "../drizzle/schema.js";

async function resetDatabase() {
  try {
    console.log("🗑️ Resetting database...");

    // Delete in correct order (foreign key constraints)
    console.log("Deleting logs...");
    await db.delete(logs);

    console.log("Deleting attachments...");
    await db.delete(attachments);

    console.log("Deleting comments...");
    await db.delete(comments);

    console.log("Deleting tasks...");
    await db.delete(tasks);

    console.log("Deleting workspace members...");
    await db.delete(workspacesMembers);

    console.log("Deleting workspaces...");
    await db.delete(workspaces);

    console.log("Deleting users...");
    await db.delete(users);

    console.log("✅ Database reset completed!");
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
