import pg from "pg";
const { Pool } = pg;

// Ensure password is always a string
const dbPassword = process.env.DB_PASSWORD
  ? String(process.env.DB_PASSWORD)
  : null;

console.log("🔍 DB Password Debug:", {
  passwordFromEnv: process.env.DB_PASSWORD,
  passwordAsString: dbPassword,
  passwordType: typeof dbPassword,
});

// Multiple connection attempts with different passwords
const connectionAttempts = [
  {
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "task_management_db",
    password: dbPassword, // Ensure string
    port: parseInt(process.env.DB_PORT) || 5432,
  },
  {
    user: "postgres",
    host: "localhost",
    database: "task_management_db",
    password: "nauffalaja", // Direct string
    port: 5432,
  },
  {
    user: "postgres",
    host: "localhost",
    database: "task_management_db",
    password: "postgres", // Default password
    port: 5432,
  },
  {
    user: "postgres",
    host: "localhost",
    database: "postgres", // Default database
    password: "nauffalaja",
    port: 5432,
  },
  {
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "postgres",
    port: 5432,
  },
];

let pool = null;

async function createConnection() {
  for (let i = 0; i < connectionAttempts.length; i++) {
    const config = connectionAttempts[i];

    try {
      console.log(
        `🔄 Attempt ${i + 1}: Trying ${config.database} with user ${
          config.user
        } and password type: ${typeof config.password}`
      );

      const testPool = new Pool({
        ...config,
        // Ensure all config values are correct types
        port: Number(config.port),
        password: config.password ? String(config.password) : undefined,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 10,
      });

      // Test the connection
      const client = await testPool.connect();
      const result = await client.query("SELECT NOW() as current_time");
      console.log(
        `✅ Connection test successful at ${result.rows[0].current_time}`
      );
      client.release();

      console.log(`✅ Connected successfully to ${config.database}!`);

      // If we connected to 'postgres' database, try to create task_management_db
      if (config.database === "postgres") {
        try {
          await testPool.query("CREATE DATABASE task_management_db");
          console.log("📦 Created task_management_db database");
        } catch (createError) {
          if (createError.code === "42P04") {
            console.log("📦 Database task_management_db already exists");
          } else {
            console.log("⚠️ Could not create database:", createError.message);
          }
        }

        // Now try to connect to task_management_db
        try {
          const targetPool = new Pool({
            ...config,
            database: "task_management_db",
            port: Number(config.port),
            password: config.password ? String(config.password) : undefined,
          });

          const targetClient = await targetPool.connect();
          await targetClient.query("SELECT NOW()");
          targetClient.release();

          console.log("🎯 Successfully connected to task_management_db");
          pool = targetPool;
          return pool;
        } catch (targetError) {
          console.log(
            "⚠️ Could not connect to task_management_db after creation:",
            targetError.message
          );
        }
      }

      pool = testPool;
      return pool;
    } catch (error) {
      console.log(`❌ Attempt ${i + 1} failed: ${error.message}`);
      console.log(`   Error code: ${error.code}`);

      if (i === connectionAttempts.length - 1) {
        console.error("🚫 All connection attempts failed!");
        console.error("💡 Troubleshooting steps:");
        console.error("   1. Check PostgreSQL service: sc query postgresql*");
        console.error("   2. Reset postgres password: psql -U postgres");
        console.error("   3. Check pg_hba.conf authentication method");
        console.error("   4. Try connecting with pgAdmin first");
      }
    }
  }

  // Return mock connection for development
  console.log("🔄 Using mock database connection for development");
  return {
    query: () => Promise.reject(new Error("Database not connected")),
    connect: () => Promise.reject(new Error("Database not connected")),
    on: () => {},
  };
}

// Initialize connection
pool = await createConnection();

// Event listeners
if (pool && pool.on) {
  pool.on("connect", () => {
    console.log("🔗 Database: Connected successfully");
  });

  pool.on("error", (err) => {
    console.error("❌ Database connection error:", err.message);
  });
}

export { pool as db };
