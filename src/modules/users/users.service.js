import bcrypt from "bcryptjs";
import { UsersRepository } from "./users.repo.js";
import {
  ROLES,
  canManageUsers,
  getDepartmentFromRole,
  isDepartmentHead,
} from "../../common/constants/roles.js";

export class UsersService {
  constructor() {
    this.usersRepo = new UsersRepository();
  }

  async getAllUsers(user, search = "") {
    try {
      // Check permissions - Owner can supervise, Manager and Heads can manage
      if (!canManageUsers(user.role)) {
        throw new Error(
          "Access denied. Only Manager and Department Heads can manage users"
        );
      }

      let users = await this.usersRepo.findAll(search);

      // REVISI: Department heads can only see users from their department
      if (isDepartmentHead(user.role)) {
        const userDepartment = getDepartmentFromRole(user.role);
        users = users.filter((u) => {
          const targetUserDepartment = getDepartmentFromRole(u.role);
          return targetUserDepartment === userDepartment;
        });
      }

      const usersWithoutPasswords = users.map(({ password, ...user }) => user);

      return {
        success: true,
        message: "Users retrieved successfully",
        data: {
          users: usersWithoutPasswords,
          canManage: canManageUsers(user.role),
          isSupervising: user.role === ROLES.OWNER,
          departmentFiltered: isDepartmentHead(user.role),
          userDepartment: isDepartmentHead(user.role)
            ? getDepartmentFromRole(user.role)
            : null,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getUserById(id) {
    try {
      const user = await this.usersRepo.findById(id);

      if (!user) {
        throw new Error("User not found");
      }

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        message: "User retrieved successfully",
        data: { user: userWithoutPassword },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createUser(userData, requestingUser) {
    try {
      // Check permissions - Manager and Department Heads can create users
      if (!canManageUsers(requestingUser.role)) {
        throw new Error(
          "Access denied. Only Manager and Department Heads can create users"
        );
      }

      // Owner override logging
      if (requestingUser.role === ROLES.OWNER) {
        console.log(
          "⚠️ Owner override: Creating user. Consider delegating to Manager/Department Head."
        );
      }

      const { name, password, role } = userData;

      // Validate required fields
      if (!name || !password || !role) {
        throw new Error("Name, password, and role are required");
      }

      // Validate role
      if (!Object.values(ROLES).includes(role)) {
        throw new Error(
          `Invalid role. Valid roles are: ${Object.values(ROLES).join(", ")}`
        );
      }

      // REVISI: Department heads can only create users for their department
      if (isDepartmentHead(requestingUser.role)) {
        const requestingUserDepartment = getDepartmentFromRole(
          requestingUser.role
        );
        const targetUserDepartment = getDepartmentFromRole(role);

        if (targetUserDepartment !== requestingUserDepartment) {
          throw new Error(
            `Access denied. You can only create users for ${requestingUserDepartment} department`
          );
        }
      }

      // Check if user already exists
      const existingUser = await this.usersRepo.findByName(name);
      if (existingUser) {
        throw new Error("User with this name already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await this.usersRepo.create({
        name,
        password: hashedPassword,
        role,
      });

      const { password: _, ...userWithoutPassword } = newUser;

      return {
        success: true,
        message: "User created successfully",
        data: {
          user: userWithoutPassword,
          createdBy: requestingUser.role,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateUser(id, userData, requestingUser) {
    try {
      const existingUser = await this.usersRepo.findById(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      // Check permissions
      if (!canManageUsers(requestingUser.role)) {
        throw new Error(
          "Access denied. Only Manager and Department Heads can update users"
        );
      }

      // REVISI: Department heads can only update users from their department
      if (isDepartmentHead(requestingUser.role)) {
        const requestingUserDepartment = getDepartmentFromRole(
          requestingUser.role
        );
        const targetUserDepartment = getDepartmentFromRole(existingUser.role);

        if (targetUserDepartment !== requestingUserDepartment) {
          throw new Error(
            `Access denied. You can only update users from ${requestingUserDepartment} department`
          );
        }
      }

      const updateData = { ...userData };

      // Hash password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }

      // Validate role if provided
      if (updateData.role && !Object.values(ROLES).includes(updateData.role)) {
        throw new Error("Invalid role");
      }

      // REVISI: Department heads can only assign roles within their department
      if (updateData.role && isDepartmentHead(requestingUser.role)) {
        const requestingUserDepartment = getDepartmentFromRole(
          requestingUser.role
        );
        const newTargetUserDepartment = getDepartmentFromRole(updateData.role);

        if (newTargetUserDepartment !== requestingUserDepartment) {
          throw new Error(
            `Access denied. You can only assign roles within ${requestingUserDepartment} department`
          );
        }
      }

      // Check name uniqueness if changed
      if (updateData.name && updateData.name !== existingUser.name) {
        const nameExists = await this.usersRepo.findByName(updateData.name);
        if (nameExists) {
          throw new Error("User with this name already exists");
        }
      }

      const updatedUser = await this.usersRepo.update(id, updateData);
      const { password: _, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        message: "User updated successfully",
        data: { user: userWithoutPassword },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteUser(id, requestingUser) {
    try {
      const existingUser = await this.usersRepo.findById(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      // Check permissions
      if (!canManageUsers(requestingUser.role)) {
        throw new Error(
          "Access denied. Only Manager and Department Heads can delete users"
        );
      }

      // REVISI: Department heads can only delete users from their department
      if (isDepartmentHead(requestingUser.role)) {
        const requestingUserDepartment = getDepartmentFromRole(
          requestingUser.role
        );
        const targetUserDepartment = getDepartmentFromRole(existingUser.role);

        if (targetUserDepartment !== requestingUserDepartment) {
          throw new Error(
            `Access denied. You can only delete users from ${requestingUserDepartment} department`
          );
        }
      }

      await this.usersRepo.delete(id);

      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
