import bcrypt from "bcryptjs";
import { db } from "../src/config/db.js";
import { users, workspaces, workspacesMembers } from "../drizzle/schema.js";
import {
  ROLES,
  WORKSPACE_ROLES,
  GENERAL_WORKSPACE_NAME,
} from "../src/common/constants/roles.js";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Hash passwords
    const hashedPassword = await bcrypt.hash("aaaaaaaa", 12);

    // Insert users
    const insertedUsers = await db
      .insert(users)
      .values([
        // Top Level
        {
          name: "company_owner",
          password: hashedPassword,
          role: ROLES.OWNER,
        },
        {
          name: "general_manager",
          password: hashedPassword,
          role: ROLES.MANAGER,
        },

        // Department Heads
        {
          name: "head_it",
          password: hashedPassword,
          role: ROLES.HEAD_IT,
        },
        {
          name: "head_marketing",
          password: hashedPassword,
          role: ROLES.HEAD_MARKETING,
        },
        {
          name: "head_finance",
          password: hashedPassword,
          role: ROLES.HEAD_FINANCE,
        },

        // Department Staff
        {
          name: "staff_it_1",
          password: hashedPassword,
          role: ROLES.STAFF_IT,
        },
        {
          name: "staff_it_2",
          password: hashedPassword,
          role: ROLES.STAFF_IT,
        },
        {
          name: "staff_marketing_1",
          password: hashedPassword,
          role: ROLES.STAFF_MARKETING,
        },
        {
          name: "staff_marketing_2",
          password: hashedPassword,
          role: ROLES.STAFF_MARKETING,
        },
        {
          name: "staff_finance_1",
          password: hashedPassword,
          role: ROLES.STAFF_FINANCE,
        },
        {
          name: "staff_finance_2",
          password: hashedPassword,
          role: ROLES.STAFF_FINANCE,
        },
      ])
      .returning();

    console.log("✅ Users inserted:", insertedUsers.length);

    // Insert workspaces - PERBAIKI: mapping nama workspace
    const insertedWorkspaces = await db
      .insert(workspaces)
      .values([
        // Department-specific workspaces
        {
          name: "Debugging GMI Club App (android)",
          description: "Debugging GMI club app (android)",
        },
        {
          name: "Debugging GMI Club App (iOS)",
          description: "Debugging GMI club app (iOS)",
        },
        {
          name: "Marketing Campaigns",
          description:
            "Marketing strategies, campaigns and promotional activities",
        },
        {
          name: "Finance Management",
          description: "Financial planning, budgeting, accounting and audit",
        },

        // Single General workspace
        {
          name: "Independence Day",
          description:
            "Organize activities, prizes, participants and others for the independence event",
        },
      ])
      .returning();

    console.log("✅ Workspaces inserted:", insertedWorkspaces.length);

    // Find workspaces - PERBAIKI: sesuaikan nama workspace yang baru
    const itWorkspaceAndroid = insertedWorkspaces.find(
      (ws) => ws.name === "Debugging GMI Club App (android)"
    );
    const itWorkspaceiOS = insertedWorkspaces.find(
      (ws) => ws.name === "Debugging GMI Club App (iOS)"
    );
    const marketingWorkspace = insertedWorkspaces.find(
      (ws) => ws.name === "Marketing Campaigns"
    );
    const financeWorkspace = insertedWorkspaces.find(
      (ws) => ws.name === "Finance Management"
    );
    const generalWorkspace = insertedWorkspaces.find(
      (ws) => ws.name === GENERAL_WORKSPACE_NAME
    );

    // Insert workspace members - PERBAIKI: sesuaikan dengan workspace baru
    const workspaceMembers = [
      // IT Workspace Android - IT department only
      {
        workspaceId: itWorkspaceAndroid.id,
        userId: insertedUsers[2].id, // head_it
        role: WORKSPACE_ROLES.ADMIN,
      },
      {
        workspaceId: itWorkspaceAndroid.id,
        userId: insertedUsers[5].id, // staff_it_1
        role: WORKSPACE_ROLES.MEMBER,
      },
      {
        workspaceId: itWorkspaceAndroid.id,
        userId: insertedUsers[6].id, // staff_it_2
        role: WORKSPACE_ROLES.MEMBER,
      },

      // IT Workspace iOS - IT department only
      {
        workspaceId: itWorkspaceiOS.id,
        userId: insertedUsers[2].id, // head_it
        role: WORKSPACE_ROLES.ADMIN,
      },
      {
        workspaceId: itWorkspaceiOS.id,
        userId: insertedUsers[5].id, // staff_it_1
        role: WORKSPACE_ROLES.MEMBER,
      },

      // Marketing Workspace - Marketing department only
      {
        workspaceId: marketingWorkspace.id,
        userId: insertedUsers[3].id, // head_marketing
        role: WORKSPACE_ROLES.ADMIN,
      },
      {
        workspaceId: marketingWorkspace.id,
        userId: insertedUsers[7].id, // staff_marketing_1
        role: WORKSPACE_ROLES.MEMBER,
      },
      {
        workspaceId: marketingWorkspace.id,
        userId: insertedUsers[8].id, // staff_marketing_2
        role: WORKSPACE_ROLES.MEMBER,
      },

      // Finance Workspace - Finance department only
      {
        workspaceId: financeWorkspace.id,
        userId: insertedUsers[4].id, // head_finance
        role: WORKSPACE_ROLES.ADMIN,
      },
      {
        workspaceId: financeWorkspace.id,
        userId: insertedUsers[9].id, // staff_finance_1
        role: WORKSPACE_ROLES.MEMBER,
      },
      {
        workspaceId: financeWorkspace.id,
        userId: insertedUsers[10].id, // staff_finance_2
        role: WORKSPACE_ROLES.MEMBER,
      },
    ];

    // Add ALL users to the General workspace
    insertedUsers.forEach((user) => {
      let workspaceRole = WORKSPACE_ROLES.MEMBER;

      // Set admin role for top management
      if ([ROLES.OWNER, ROLES.MANAGER].includes(user.role)) {
        workspaceRole = WORKSPACE_ROLES.ADMIN;
      }

      workspaceMembers.push({
        workspaceId: generalWorkspace.id,
        userId: user.id,
        role: workspaceRole,
      });
    });

    await db.insert(workspacesMembers).values(workspaceMembers);
    console.log("✅ Workspace members inserted:", workspaceMembers.length);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Sample Users Created:");
    console.log("==========================================");

    // Group users by hierarchy
    const usersByRole = {
      "Top Management": insertedUsers.filter((u) =>
        [ROLES.OWNER, ROLES.MANAGER].includes(u.role)
      ),
      "Department Heads": insertedUsers.filter((u) =>
        [ROLES.HEAD_IT, ROLES.HEAD_MARKETING, ROLES.HEAD_FINANCE].includes(
          u.role
        )
      ),
      "Department Staff": insertedUsers.filter((u) =>
        [ROLES.STAFF_IT, ROLES.STAFF_MARKETING, ROLES.STAFF_FINANCE].includes(
          u.role
        )
      ),
    };

    Object.entries(usersByRole).forEach(([category, users]) => {
      console.log(`\n${category}:`);
      users.forEach((user) => {
        console.log(
          `  👤 ${user.name} | Role: ${user.role} | Password: aaaaaaaa` // PERBAIKI: sesuaikan password
        );
      });
    });

    console.log("\n🏢 Workspaces Created:");
    console.log("==========================================");
    insertedWorkspaces.forEach((workspace) => {
      if (workspace.name === GENERAL_WORKSPACE_NAME) {
        console.log(`🌍 ${workspace.name} | Access: ALL USERS`);
      } else {
        console.log(`🏢 ${workspace.name} | Access: Department specific`);
      }
    });

    console.log("\n🧪 Testing Accounts:");
    console.log("==========================================");
    console.log("• Owner: company_owner / aaaaaaaa");
    console.log("• Manager: general_manager / aaaaaaaa");
    console.log("• IT Head: head_it / aaaaaaaa");
    console.log("• Marketing Head: head_marketing / aaaaaaaa");
    console.log("• Finance Head: head_finance / aaaaaaaa");
    console.log("• Staff: staff_it_1, staff_marketing_1, etc. / aaaaaaaa");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
