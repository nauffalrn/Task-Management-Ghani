import bcrypt from "bcrypt";
import { db } from "../src/config/db.js";
import { users, workspaces, workspacesMembers } from "../drizzle/schema.js";
import { ROLES } from "../src/common/constants/roles.js";
import { BCRYPT_CONFIG } from "../src/common/constants/app.js";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    const hashedPassword = await bcrypt.hash(
      "aaaaaaaa",
      BCRYPT_CONFIG.SALT_ROUNDS
    );

    // Insert users
    const insertedUsers = await db
      .insert(users)
      .values([
        {
          name: "Admin User",
          email: "admin@example.com",
          password: hashedPassword,
          role: ROLES.ADMIN,
        },
        {
          name: "Manager User",
          email: "manager@example.com",
          password: hashedPassword,
          role: ROLES.MANAGER,
        },
        {
          name: "Member User",
          email: "member@example.com",
          password: hashedPassword,
          role: ROLES.MEMBER,
        },
      ])
      .returning();

    console.log(`✅ Created ${insertedUsers.length} users`);

    // Insert workspaces
    const insertedWorkspaces = await db
      .insert(workspaces)
      .values([
        {
          name: "Development Team",
          description: "Main development workspace",
          createdBy: insertedUsers[0].id,
        },
        {
          name: "Marketing Team",
          description: "Marketing and content workspace",
          createdBy: insertedUsers[1].id,
        },
      ])
      .returning();

    console.log(`✅ Created ${insertedWorkspaces.length} workspaces`);

    // Insert workspace members
    const workspaceMembers = [
      {
        workspaceId: insertedWorkspaces[0].id,
        userId: insertedUsers[0].id,
        role: ROLES.ADMIN,
        addedBy: insertedUsers[0].id,
      },
      {
        workspaceId: insertedWorkspaces[0].id,
        userId: insertedUsers[1].id,
        role: ROLES.MANAGER,
        addedBy: insertedUsers[0].id,
      },
      {
        workspaceId: insertedWorkspaces[0].id,
        userId: insertedUsers[2].id,
        role: ROLES.MEMBER,
        addedBy: insertedUsers[0].id,
      },
      {
        workspaceId: insertedWorkspaces[1].id,
        userId: insertedUsers[1].id,
        role: ROLES.ADMIN,
        addedBy: insertedUsers[1].id,
      },
    ];

    await db.insert(workspacesMembers).values(workspaceMembers);
    console.log(`✅ Created ${workspaceMembers.length} workspace memberships`);

    console.log("🎉 Database seeding completed successfully!");
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
