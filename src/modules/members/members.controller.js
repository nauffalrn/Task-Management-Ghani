import { BaseController } from "../../common/controller/base.controller.js";
import { MembersService } from "./members.service.js";

class MembersController extends BaseController {
  constructor() {
    super();
    this.membersService = new MembersService();
  }

  getWorkspaceMembers = async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const { page = 1, limit = 10, role } = req.query;

      const result = await this.membersService.getWorkspaceMembers(
        workspaceId,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          role,
          requesterId: req.user.id,
          requesterRole: req.user.role,
        }
      );

      return this.sendSuccessResponse(
        res,
        "Workspace members retrieved successfully",
        result.data,
        result.meta
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  getMemberById = async (req, res) => {
    try {
      const { id } = req.params;

      const member = await this.membersService.getMemberById(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Member retrieved successfully",
        member
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  addMember = async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const { userId } = req.body;

      const member = await this.membersService.addMember(workspaceId, userId, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Member added to workspace successfully",
        member,
        null,
        201
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  removeMember = async (req, res) => {
    try {
      const { workspaceId, userId } = req.params;

      await this.membersService.removeMember(workspaceId, userId, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Member removed from workspace successfully"
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  updateMemberRole = async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const member = await this.membersService.updateMemberRole(id, role, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Member role updated successfully",
        member
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };
}

const membersController = new MembersController();

export const {
  getWorkspaceMembers,
  getMemberById,
  addMember,
  removeMember,
  updateMemberRole,
} = membersController;
