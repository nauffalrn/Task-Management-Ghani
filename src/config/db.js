import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "../../drizzle/schema.js";

const { Pool } = pkg;

// Ensure password is always a string
const dbPassword = process.env.DB_PASSWORD
  ? String(process.env.DB_PASSWORD)
  : null;

console.log("🔍 DB Password Debug:", {
  passwordFromEnv: process.env.DB_PASSWORD,
  passwordAsString: dbPassword,
  passwordType: typeof dbPassword,
});

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "task_management_db",
  password: dbPassword || "nauffalaja", // Fallback to your password
  port: parseInt(process.env.DB_PORT) || 5432,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
};

// Create PostgreSQL pool
console.log("🔄 Creating PostgreSQL connection pool...");
const pool = new Pool(dbConfig);

// Test connection
try {
  const client = await pool.connect();
  const result = await client.query("SELECT NOW() as current_time");
  console.log(
    `✅ Connection test successful at ${result.rows[0].current_time}`
  );
  client.release();
  console.log("✅ Connected successfully to task_management_db!");
} catch (error) {
  console.error("❌ Database connection failed:", error.message);
  process.exit(1);
}

// Create Drizzle instance with schema
console.log("🔄 Creating Drizzle ORM instance...");
export const db = drizzle(pool, { schema });

// Add debug logging
console.log("🔍 Drizzle DB instance created:", {
  hasSelect: typeof db.select === "function",
  hasInsert: typeof db.insert === "function",
  hasUpdate: typeof db.update === "function",
  hasDelete: typeof db.delete === "function",
  methods: Object.getOwnPropertyNames(db).filter(
    (prop) => typeof db[prop] === "function"
  ),
});

// Event listeners for pool
pool.on("connect", () => {
  console.log("🔗 Database pool: Client connected");
});

pool.on("error", (err) => {
  console.error("❌ Database pool error:", err.message);
});

// Export both for backward compatibility
export { pool };
export default db;
