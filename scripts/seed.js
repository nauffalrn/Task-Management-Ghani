import bcryptjs from "bcryptjs";
import { db } from "../src/config/db.js";

const BCRYPT_CONFIG = {
  SALT_ROUNDS: 12,
};

// ROLES constants (sama seperti di roles.js)
const ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  HEAD_IT: "head_it",
  HEAD_MARKETING: "head_marketing",
  HEAD_FINANCE: "head_finance",
  STAFF_IT: "staff_it",
  STAFF_MARKETING: "staff_marketing",
  STAFF_FINANCE: "staff_finance",
};

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    const hashedPassword = await bcryptjs.hash(
      "aaaaaaaa",
      BCRYPT_CONFIG.SALT_ROUNDS
    );

    // Seed Users dengan raw SQL - 8 users sesuai roles
    const users = [
      {
        name: "Owner User",
        email: "owner@gmi.com",
        password: hashedPassword,
        role: ROLES.OWNER,
      },
      {
        name: "Manager User",
        email: "manager@gmi.com",
        password: hashedPassword,
        role: ROLES.MANAGER,
      },
      {
        name: "IT Head",
        email: "head.it@gmi.com",
        password: hashedPassword,
        role: ROLES.HEAD_IT,
      },
      {
        name: "Marketing Head",
        email: "head.marketing@gmi.com",
        password: hashedPassword,
        role: ROLES.HEAD_MARKETING,
      },
      {
        name: "Finance Head",
        email: "head.finance@gmi.com",
        password: hashedPassword,
        role: ROLES.HEAD_FINANCE,
      },
      {
        name: "IT Staff",
        email: "staff.it@gmi.com",
        password: hashedPassword,
        role: ROLES.STAFF_IT,
      },
      {
        name: "Marketing Staff",
        email: "staff.marketing@gmi.com",
        password: hashedPassword,
        role: ROLES.STAFF_MARKETING,
      },
      {
        name: "Finance Staff",
        email: "staff.finance@gmi.com",
        password: hashedPassword,
        role: ROLES.STAFF_FINANCE,
      },
    ];

    console.log("👥 Seeding users...");
    const insertedUsers = [];
    for (const user of users) {
      try {
        const result = await db.query(
          `INSERT INTO users (name, email, password, role) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id, name, email, role`,
          [user.name, user.email, user.password, user.role]
        );
        console.log(`✅ Created user: ${result.rows[0].email}`);
        insertedUsers.push(result.rows[0]);
      } catch (error) {
        if (error.code === "23505") {
          console.log(`⚠️ User already exists: ${user.email}`);
          // Get existing user
          const existing = await db.query(
            "SELECT id, name, email, role FROM users WHERE email = $1",
            [user.email]
          );
          if (existing.rows[0]) {
            insertedUsers.push(existing.rows[0]);
          }
        } else {
          console.error(`❌ Error creating user ${user.email}:`, error.message);
        }
      }
    }

    console.log(`✅ Total users: ${insertedUsers.length}`);

    // Seed Workspaces - 4 workspaces
    console.log("🏢 Seeding workspaces...");
    const workspaces = [
      {
        name: "IT Department",
        description: "IT workspace for system development and maintenance",
        created_by: insertedUsers[2]?.id || 3, // IT Head
      },
      {
        name: "Marketing Department",
        description: "Marketing workspace for campaigns and content creation",
        created_by: insertedUsers[3]?.id || 4, // Marketing Head
      },
      {
        name: "Finance Department",
        description: "Finance workspace for budget and financial management",
        created_by: insertedUsers[4]?.id || 5, // Finance Head
      },
      {
        name: "Independence Day",
        description:
          "General workspace for Independence Day celebration project",
        created_by: insertedUsers[1]?.id || 2, // Manager
      },
    ];

    const insertedWorkspaces = [];
    for (const workspace of workspaces) {
      try {
        const result = await db.query(
          `INSERT INTO workspaces (name, description, created_by)
           VALUES ($1, $2, $3)
           RETURNING id, name`,
          [workspace.name, workspace.description, workspace.created_by]
        );
        console.log(`✅ Created workspace: ${result.rows[0].name}`);
        insertedWorkspaces.push(result.rows[0]);
      } catch (error) {
        console.error(
          `❌ Error creating workspace ${workspace.name}:`,
          error.message
        );
      }
    }

    // Seed Workspace Members
    console.log("👨‍💼 Seeding workspace members...");
    const workspaceMembers = [
      // Owner access to all workspaces - role OWNER
      {
        workspace_id: insertedWorkspaces[0]?.id || 1,
        user_id: insertedUsers[0]?.id || 1,
        role: ROLES.OWNER,
      },
      {
        workspace_id: insertedWorkspaces[1]?.id || 2,
        user_id: insertedUsers[0]?.id || 1,
        role: ROLES.OWNER,
      },
      {
        workspace_id: insertedWorkspaces[2]?.id || 3,
        user_id: insertedUsers[0]?.id || 1,
        role: ROLES.OWNER,
      },
      {
        workspace_id: insertedWorkspaces[3]?.id || 4,
        user_id: insertedUsers[0]?.id || 1,
        role: ROLES.OWNER,
      },

      // Manager access to all workspaces - role MANAGER
      {
        workspace_id: insertedWorkspaces[0]?.id || 1,
        user_id: insertedUsers[1]?.id || 2,
        role: ROLES.MANAGER,
      },
      {
        workspace_id: insertedWorkspaces[1]?.id || 2,
        user_id: insertedUsers[1]?.id || 2,
        role: ROLES.MANAGER,
      },
      {
        workspace_id: insertedWorkspaces[2]?.id || 3,
        user_id: insertedUsers[1]?.id || 2,
        role: ROLES.MANAGER,
      },
      {
        workspace_id: insertedWorkspaces[3]?.id || 4,
        user_id: insertedUsers[1]?.id || 2,
        role: ROLES.MANAGER,
      },

      // IT Department members
      {
        workspace_id: insertedWorkspaces[0]?.id || 1,
        user_id: insertedUsers[2]?.id || 3,
        role: ROLES.HEAD_IT,
      },
      {
        workspace_id: insertedWorkspaces[0]?.id || 1,
        user_id: insertedUsers[5]?.id || 6,
        role: ROLES.STAFF_IT,
      },

      // Marketing Department members
      {
        workspace_id: insertedWorkspaces[1]?.id || 2,
        user_id: insertedUsers[3]?.id || 4,
        role: ROLES.HEAD_MARKETING,
      },
      {
        workspace_id: insertedWorkspaces[1]?.id || 2,
        user_id: insertedUsers[6]?.id || 7,
        role: ROLES.STAFF_MARKETING,
      },

      // Finance Department members
      {
        workspace_id: insertedWorkspaces[2]?.id || 3,
        user_id: insertedUsers[4]?.id || 5,
        role: ROLES.HEAD_FINANCE,
      },
      {
        workspace_id: insertedWorkspaces[2]?.id || 3,
        user_id: insertedUsers[7]?.id || 8,
        role: ROLES.STAFF_FINANCE,
      },

      // Independence Day project members - sesuai role mereka
      {
        workspace_id: insertedWorkspaces[3]?.id || 4,
        user_id: insertedUsers[2]?.id || 3,
        role: ROLES.HEAD_IT,
      },
      {
        workspace_id: insertedWorkspaces[3]?.id || 4,
        user_id: insertedUsers[3]?.id || 4,
        role: ROLES.HEAD_MARKETING,
      },
      {
        workspace_id: insertedWorkspaces[3]?.id || 4,
        user_id: insertedUsers[4]?.id || 5,
        role: ROLES.HEAD_FINANCE,
      },
      {
        workspace_id: insertedWorkspaces[3]?.id || 4,
        user_id: insertedUsers[6]?.id || 7,
        role: ROLES.STAFF_MARKETING,
      },
    ];

    for (const member of workspaceMembers) {
      try {
        await db.query(
          `INSERT INTO workspaces_members (workspace_id, user_id, role)
           VALUES ($1, $2, $3)`,
          [member.workspace_id, member.user_id, member.role]
        );
        console.log(`✅ Added member to workspace ${member.workspace_id}`);
      } catch (error) {
        if (error.code === "23505") {
          console.log(
            `⚠️ Member already exists in workspace ${member.workspace_id}`
          );
        } else {
          console.error(`❌ Error adding member:`, error.message);
        }
      }
    }

    // Seed Sample Tasks
    console.log("📋 Seeding sample tasks...");
    const tasks = [
      {
        workspace_id: insertedWorkspaces[0]?.id || 1, // IT Department
        title: "Setup Database Schema",
        description: "Create and migrate database tables for new project",
        status: "done",
        assigned_to: insertedUsers[5]?.id || 6, // IT Staff
        created_by: insertedUsers[2]?.id || 3, // IT Head
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        workspace_id: insertedWorkspaces[0]?.id || 1, // IT Department
        title: "Implement Authentication System",
        description: "JWT-based authentication for the application",
        status: "in_progress",
        assigned_to: insertedUsers[5]?.id || 6, // IT Staff
        created_by: insertedUsers[2]?.id || 3, // IT Head
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        workspace_id: insertedWorkspaces[1]?.id || 2, // Marketing Department
        title: "Create Marketing Campaign",
        description: "Design and plan marketing campaign for Q4",
        status: "todo",
        assigned_to: insertedUsers[6]?.id || 7, // Marketing Staff
        created_by: insertedUsers[3]?.id || 4, // Marketing Head
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
      {
        workspace_id: insertedWorkspaces[3]?.id || 4, // Independence Day
        title: "Organize Independence Day Event",
        description: "Plan and coordinate company Independence Day celebration",
        status: "in_progress",
        assigned_to: insertedUsers[6]?.id || 7, // Marketing Staff
        created_by: insertedUsers[1]?.id || 2, // Manager
        due_date: new Date("2024-08-17"),
      },
    ];

    for (const task of tasks) {
      try {
        const result = await db.query(
          `INSERT INTO tasks (workspace_id, title, description, status, assigned_to, created_by, due_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, title`,
          [
            task.workspace_id,
            task.title,
            task.description,
            task.status,
            task.assigned_to,
            task.created_by,
            task.due_date,
          ]
        );
        console.log(`✅ Created task: ${result.rows[0].title}`);
      } catch (error) {
        console.error(`❌ Error creating task ${task.title}:`, error.message);
      }
    }

    // Summary
    const userCount = await db.query("SELECT COUNT(*) as count FROM users");
    const workspaceCount = await db.query(
      "SELECT COUNT(*) as count FROM workspaces"
    );
    const memberCount = await db.query(
      "SELECT COUNT(*) as count FROM workspaces_members"
    );
    const taskCount = await db.query("SELECT COUNT(*) as count FROM tasks");

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${userCount.rows[0].count}`);
    console.log(`   🏢 Workspaces: ${workspaceCount.rows[0].count}`);
    console.log(`   👨‍💼 Workspace Members: ${memberCount.rows[0].count}`);
    console.log(`   📋 Tasks: ${taskCount.rows[0].count}`);

    console.log("\n📋 CREATED ACCOUNTS:");
    console.log("🔴 owner@gmi.com (password: aaaaaaaa) - OWNER");
    console.log("🟠 manager@gmi.com (password: aaaaaaaa) - MANAGER");
    console.log("🔵 head.it@gmi.com (password: aaaaaaaa) - HEAD_IT");
    console.log(
      "🟢 head.marketing@gmi.com (password: aaaaaaaa) - HEAD_MARKETING"
    );
    console.log("🟡 head.finance@gmi.com (password: aaaaaaaa) - HEAD_FINANCE");
    console.log("⚪ staff.it@gmi.com (password: aaaaaaaa) - STAFF_IT");
    console.log(
      "⚪ staff.marketing@gmi.com (password: aaaaaaaa) - STAFF_MARKETING"
    );
    console.log(
      "⚪ staff.finance@gmi.com (password: aaaaaaaa) - STAFF_FINANCE"
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seedDatabase()
  .then(() => {
    console.log("Seeding finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
