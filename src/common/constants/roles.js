export const ROLES = {
  // Top Level - Supervision & oversight
  OWNER: "owner",
  MANAGER: "manager",

  // Department Heads - Operational management
  HEAD_IT: "head_it",
  HEAD_MARKETING: "head_marketing",
  HEAD_FINANCE: "head_finance",

  // Department Staff - Execution
  STAFF_IT: "staff_it",
  STAFF_MARKETING: "staff_marketing",
  STAFF_FINANCE: "staff_finance",
};

export const ROLE_HIERARCHY = {
  [ROLES.OWNER]: 6,
  [ROLES.MANAGER]: 5,
  [ROLES.HEAD_IT]: 4,
  [ROLES.HEAD_MARKETING]: 4,
  [ROLES.HEAD_FINANCE]: 4,
  [ROLES.STAFF_IT]: 2,
  [ROLES.STAFF_MARKETING]: 2,
  [ROLES.STAFF_FINANCE]: 2,
};

export const WORKSPACE_ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
  VIEWER: "viewer",
};

// Roles that can access all workspaces (monitoring/supervision)
export const GLOBAL_ACCESS_ROLES = [ROLES.OWNER, ROLES.MANAGER];

// Roles that can create workspaces (operational management)
export const WORKSPACE_CREATOR_ROLES = [
  ROLES.MANAGER, // Manager can create any workspace
  ROLES.HEAD_IT, // Department heads create their own
  ROLES.HEAD_MARKETING,
  ROLES.HEAD_FINANCE,
];

// Roles that can create general workspace (company-wide initiatives)
export const GENERAL_WORKSPACE_CREATOR_ROLES = [ROLES.MANAGER];

// Roles that can manage members (operational management)
export const MEMBER_MANAGER_ROLES = [
  ROLES.MANAGER, // Can manage all workspace members
  ROLES.HEAD_IT, // Can manage their department workspace members
  ROLES.HEAD_MARKETING,
  ROLES.HEAD_FINANCE,
];

// Roles that can manage users (HR/Admin functions) - UPDATED: Include Department Heads
export const USER_MANAGER_ROLES = [
  ROLES.MANAGER, // Manager can manage users
  ROLES.HEAD_IT, // Department heads can manage their users
  ROLES.HEAD_MARKETING,
  ROLES.HEAD_FINANCE,
];

// Owner permissions (supervision with override capability)
export const OWNER_PERMISSIONS = {
  canViewAll: true, // Monitor everything
  canCreateWorkspace: true, // Override capability (but not primary responsibility)
  canManageMembers: true, // Override capability
  canManageUsers: true, // Override capability
  canAssignTasks: true, // Can assign high-priority tasks
  canViewReports: true, // Access to all reports and analytics
};

// The single general workspace name
export const GENERAL_WORKSPACE_NAME = "Independence Day";

// Helper functions
export const isDepartmentHead = (role) => {
  return [ROLES.HEAD_IT, ROLES.HEAD_MARKETING, ROLES.HEAD_FINANCE].includes(
    role
  );
};

export const isDepartmentStaff = (role) => {
  return [ROLES.STAFF_IT, ROLES.STAFF_MARKETING, ROLES.STAFF_FINANCE].includes(
    role
  );
};

export const getDepartmentFromRole = (role) => {
  if (role === ROLES.HEAD_IT || role === ROLES.STAFF_IT) return "IT";
  if (role === ROLES.HEAD_MARKETING || role === ROLES.STAFF_MARKETING)
    return "MARKETING";
  if (role === ROLES.HEAD_FINANCE || role === ROLES.STAFF_FINANCE)
    return "FINANCE";
  return null;
};

// Check if user can create workspace
export const canCreateWorkspace = (userRole) => {
  return WORKSPACE_CREATOR_ROLES.includes(userRole) || userRole === ROLES.OWNER;
};

// Check if user can manage members in specific workspace
export const canManageWorkspaceMembers = (userRole, workspaceName = null) => {
  if (userRole === ROLES.OWNER || userRole === ROLES.MANAGER) return true;

  if (isDepartmentHead(userRole) && workspaceName) {
    const userDepartment = getDepartmentFromRole(userRole);
    return (
      workspaceName.toLowerCase().includes(userDepartment.toLowerCase()) ||
      workspaceName === GENERAL_WORKSPACE_NAME
    );
  }

  return false;
};

// Check if user can manage users
export const canManageUsers = (userRole) => {
  return USER_MANAGER_ROLES.includes(userRole) || userRole === ROLES.OWNER;
};
