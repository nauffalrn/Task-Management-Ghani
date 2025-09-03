import { BaseController } from "../../common/controller/base.controller.js";
import { MembersService } from "./members.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";

export class MembersController extends BaseController {
  constructor() {
    const membersService = new MembersService();
    super(membersService, "Member");
  }

  async getWorkspaceMembers(req, res, next) {
    try {
      const { workspaceId } = req.params;
      const members = await this.service.getWorkspaceMembers(
        parseInt(workspaceId),
        req.user
      );

      return ResponseHelper.success(
        res,
        members,
        "Workspace members retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async addMember(req, res, next) {
    try {
      const { workspaceId } = req.params;
      const member = await this.service.addMember(
        parseInt(workspaceId),
        req.body,
        req.user
      );

      return ResponseHelper.created(res, member, "Member added successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateMember(req, res, next) {
    try {
      const { workspaceId, userId } = req.params;
      const member = await this.service.updateMember(
        parseInt(workspaceId),
        parseInt(userId),
        req.body,
        req.user
      );

      return ResponseHelper.success(res, member, "Member updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      const { workspaceId, userId } = req.params;
      await this.service.removeMember(
        parseInt(workspaceId),
        parseInt(userId),
        req.user
      );

      return ResponseHelper.success(res, null, "Member removed successfully");
    } catch (error) {
      next(error);
    }
  }
}

// Export individual functions for routes
const controller = new MembersController();

export const getWorkspaceMembers = (req, res, next) =>
  controller.getWorkspaceMembers(req, res, next);

export const addMember = (req, res, next) =>
  controller.addMember(req, res, next);

export const updateMember = (req, res, next) =>
  controller.updateMember(req, res, next);

export const removeMember = (req, res, next) =>
  controller.removeMember(req, res, next);
