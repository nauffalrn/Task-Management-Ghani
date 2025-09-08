import bcryptjs from "bcryptjs";
import { db } from "../src/config/db.js";
import { users, workspaces, workspacesMembers } from "../drizzle/schema.js";
import { ROLES } from "../src/common/constants/roles.js";
import { BCRYPT_CONFIG } from "../src/common/constants/app.js";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    const hashedPassword = await bcryptjs.hash(
      "aaaaaaaa",
      BCRYPT_CONFIG.SALT_ROUNDS
    );

    const insertedUsers = await db
      .insert(users)
      .values([
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
      ])
      .returning();

    console.log(`✅ Created ${insertedUsers.length} users`);

    const insertedWorkspaces = await db
      .insert(workspaces)
      .values([
        {
          name: "IT Department",
          description: "IT workspace for system development and maintenance",
          createdBy: insertedUsers[2].id,
        },
        {
          name: "Marketing Department",
          description: "Marketing workspace for campaigns and content creation",
          createdBy: insertedUsers[3].id,
        },
        {
          name: "Finance Department",
          description: "Finance workspace for budget and financial management",
          createdBy: insertedUsers[4].id,
        },
        {
          name: "Independence Day",
          description:
            "General workspace for Independence Day celebration project",
          createdBy: insertedUsers[1].id,
        },
      ])
      .returning();

    console.log(`✅ Created ${insertedWorkspaces.length} workspaces`);

    // PERBAIKI: Tambahkan role untuk setiap workspace member
    const workspaceMembers = [
      // Owner access to all workspaces - role OWNER
      {
        workspaceId: insertedWorkspaces[0].id,
        userId: insertedUsers[0].id,
        role: ROLES.OWNER,
      },
      {
        workspaceId: insertedWorkspaces[1].id,
        userId: insertedUsers[0].id,
        role: ROLES.OWNER,
      },
      {
        workspaceId: insertedWorkspaces[2].id,
        userId: insertedUsers[0].id,
        role: ROLES.OWNER,
      },
      {
        workspaceId: insertedWorkspaces[3].id,
        userId: insertedUsers[0].id,
        role: ROLES.OWNER,
      },

      // Manager access to all workspaces - role MANAGER
      {
        workspaceId: insertedWorkspaces[0].id,
        userId: insertedUsers[1].id,
        role: ROLES.MANAGER,
      },
      {
        workspaceId: insertedWorkspaces[1].id,
        userId: insertedUsers[1].id,
        role: ROLES.MANAGER,
      },
      {
        workspaceId: insertedWorkspaces[2].id,
        userId: insertedUsers[1].id,
        role: ROLES.MANAGER,
      },
      {
        workspaceId: insertedWorkspaces[3].id,
        userId: insertedUsers[1].id,
        role: ROLES.MANAGER,
      },

      // IT Department members
      {
        workspaceId: insertedWorkspaces[0].id,
        userId: insertedUsers[2].id,
        role: ROLES.HEAD_IT,
      },
      {
        workspaceId: insertedWorkspaces[0].id,
        userId: insertedUsers[5].id,
        role: ROLES.STAFF_IT,
      },

      // Marketing Department members
      {
        workspaceId: insertedWorkspaces[1].id,
        userId: insertedUsers[3].id,
        role: ROLES.HEAD_MARKETING,
      },
      {
        workspaceId: insertedWorkspaces[1].id,
        userId: insertedUsers[6].id,
        role: ROLES.STAFF_MARKETING,
      },

      // Finance Department members
      {
        workspaceId: insertedWorkspaces[2].id,
        userId: insertedUsers[4].id,
        role: ROLES.HEAD_FINANCE,
      },
      {
        workspaceId: insertedWorkspaces[2].id,
        userId: insertedUsers[7].id,
        role: ROLES.STAFF_FINANCE,
      },

      // Independence Day project members - sesuai role mereka
      {
        workspaceId: insertedWorkspaces[3].id,
        userId: insertedUsers[2].id,
        role: ROLES.HEAD_IT,
      },
      {
        workspaceId: insertedWorkspaces[3].id,
        userId: insertedUsers[3].id,
        role: ROLES.HEAD_MARKETING,
      },
      {
        workspaceId: insertedWorkspaces[3].id,
        userId: insertedUsers[4].id,
        role: ROLES.HEAD_FINANCE,
      },
      {
        workspaceId: insertedWorkspaces[3].id,
        userId: insertedUsers[6].id,
        role: ROLES.STAFF_MARKETING,
      },
    ];

    await db.insert(workspacesMembers).values(workspaceMembers);
    console.log(`✅ Created ${workspaceMembers.length} workspace memberships`);

    console.log("🎉 Database seeding completed successfully!");
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

    return { users: insertedUsers, workspaces: insertedWorkspaces };
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
