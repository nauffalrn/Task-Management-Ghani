import { AppError } from "../utils/appError.js";
import { ROLES } from "../constants/roles.js";

export class BaseService {
  constructor(repository, entityName = "record") {
    this.repository = repository;
    this.entityName = entityName;
  }

  // Permission checks
  hasOwnerAccess(requesterRole) {
    return requesterRole === ROLES.OWNER;
  }

  hasManagerAccess(requesterRole) {
    return [ROLES.OWNER, ROLES.MANAGER].includes(requesterRole);
  }

  hasHeadAccess(requesterRole) {
    return [
      ROLES.OWNER,
      ROLES.MANAGER,
      ROLES.HEAD_IT,
      ROLES.HEAD_MARKETING,
      ROLES.HEAD_FINANCE,
    ].includes(requesterRole);
  }

  hasStaffAccess(requesterRole) {
    return Object.values(ROLES).includes(requesterRole);
  }

  // Department checks
  isSameDepartment(role1, role2) {
    const departments = {
      IT: [ROLES.HEAD_IT, ROLES.STAFF_IT],
      MARKETING: [ROLES.HEAD_MARKETING, ROLES.STAFF_MARKETING],
      FINANCE: [ROLES.HEAD_FINANCE, ROLES.STAFF_FINANCE],
    };

    for (const dept of Object.values(departments)) {
      if (dept.includes(role1) && dept.includes(role2)) {
        return true;
      }
    }
    return false;
  }

  // Pagination helper
  getPaginationMeta(page, limit, total) {
    const totalPages = Math.ceil(total / limit);

    return {
      currentPage: page,
      perPage: limit,
      totalItems: total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Validation helpers
  validateRequiredFields(data, requiredFields) {
    const missing = requiredFields.filter((field) => !data[field]);
    if (missing.length > 0) {
      throw AppError.badRequest(
        `Missing required fields: ${missing.join(", ")}`
      );
    }
  }

  validatePermission(condition, message = "Insufficient permissions") {
    if (!condition) {
      throw AppError.forbidden(message);
    }
  }

  validateNotFound(item, message) {
    if (!item) {
      throw AppError.notFound(message || `${this.entityName} not found`);
    }
  }

  async getById(id) {
    if (!id) {
      throw AppError.badRequest(`${this.entityName} ID is required`);
    }
    return await this.repository.findById(id);
  }

  async getAll(options = {}) {
    return await this.repository.findAll(options);
  }

  async create(data) {
    if (!data) {
      throw AppError.badRequest(`${this.entityName} data is required`);
    }
    return await this.repository.create(data);
  }

  async update(id, data) {
    if (!id || !data) {
      throw AppError.badRequest(`${this.entityName} ID and data are required`);
    }
    return await this.repository.update(id, data);
  }

  async delete(id) {
    if (!id) {
      throw AppError.badRequest(`${this.entityName} ID is required`);
    }
    return await this.repository.delete(id);
  }

  async validateExists(id) {
    const record = await this.getById(id);
    if (!record) {
      throw AppError.notFound(`${this.entityName} not found`);
    }
    return record;
  }
}
