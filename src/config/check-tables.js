import { db } from "./db.js";

export const checkDatabaseTables = async () => {
  try {
    console.log("🔍 Checking actual database structure...");

    // List all tables
    console.log("\n📋 ALL TABLES:");
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const allTables = await db.execute(tablesQuery);
    console.log(
      "All tables:",
      allTables.rows.map((row) => row.table_name)
    );

    // Check attachments table structure
    if (allTables.rows.find((row) => row.table_name === "attachments")) {
      console.log("\n📋 ATTACHMENTS TABLE STRUCTURE:");
      const attachmentsQuery = `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'attachments' 
        ORDER BY ordinal_position;
      `;

      const attachmentsColumns = await db.execute(attachmentsQuery);
      attachmentsColumns.rows.forEach((col) => {
        console.log(
          `  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
        );
      });
    }

    // Check logs table structure
    if (allTables.rows.find((row) => row.table_name === "logs")) {
      console.log("\n📋 LOGS TABLE STRUCTURE:");
      const logsQuery = `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'logs' 
        ORDER BY ordinal_position;
      `;

      const logsColumns = await db.execute(logsQuery);
      logsColumns.rows.forEach((col) => {
        console.log(
          `  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
        );
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking database:", error);
    process.exit(1);
  }
};

checkDatabaseTables();
