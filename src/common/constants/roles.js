export const ROLES = {
  // High Level - Can access all workspaces
  MANAGER: "manager",

  // Mid Level - Can create/manage workspaces
  LEADER: "leader",
  PROJECT_MANAGER: "project_manager",

  // Department Level - Limited to assigned workspaces
  HR: "hr",
  IT: "it",
  FINANCE: "finance",
  MARKETING: "marketing",
  EMPLOYEE: "employee",
};

export const ROLE_HIERARCHY = {
  [ROLES.MANAGER]: 5,
  [ROLES.LEADER]: 4,
  [ROLES.PROJECT_MANAGER]: 4,
  [ROLES.HR]: 3,
  [ROLES.IT]: 3,
  [ROLES.FINANCE]: 3,
  [ROLES.MARKETING]: 3,
  [ROLES.EMPLOYEE]: 1,
};

export const WORKSPACE_ROLES = {
  ADMIN: "admin", // Can manage workspace
  MEMBER: "member", // Can participate
  VIEWER: "viewer", // Read only
};

// Roles that can access all workspaces
export const GLOBAL_ACCESS_ROLES = [ROLES.MANAGER];

// Roles that can create workspaces
export const WORKSPACE_CREATOR_ROLES = [
  ROLES.MANAGER,
  ROLES.LEADER,
  ROLES.PROJECT_MANAGER,
];
