import { BaseController } from "../../common/controller/base.controller.js";
import { MembersService } from "./members.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";

class MembersController extends BaseController {
  constructor() {
    super();
    this.membersService = new MembersService();
  }

  // GET /api/members - List all members
  getMembers = async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, workspaceId, role } = req.query;

      const members = await this.membersService.getAllMembers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        workspaceId: workspaceId ? parseInt(workspaceId) : undefined,
        role,
      });

      return ResponseHelper.success(
        res,
        members,
        "Members retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/members/:id - Get member by ID
  getMemberById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const member = await this.membersService.getMemberById(id);

      return ResponseHelper.success(
        res,
        member,
        "Member retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // POST /api/members - Add member to workspace
  addMember = async (req, res, next) => {
    try {
      const memberData = req.body;
      const currentUserId = req.user.userId;

      const member = await this.membersService.addMember(
        memberData,
        currentUserId
      );

      return ResponseHelper.created(res, member, "Member added successfully");
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/members/:id - Update member role
  updateMember = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const currentUserId = req.user.userId;

      const member = await this.membersService.updateMember(
        id,
        updateData,
        currentUserId
      );

      return ResponseHelper.success(res, member, "Member updated successfully");
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/members/:id - Remove member from workspace
  removeMember = async (req, res, next) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user.userId;

      await this.membersService.removeMember(id, currentUserId);

      return ResponseHelper.success(res, null, "Member removed successfully");
    } catch (error) {
      next(error);
    }
  };

  // GET /api/members/workspace/:workspaceId - Get members by workspace
  getMembersByWorkspace = async (req, res, next) => {
    try {
      const { workspaceId } = req.params;

      const members = await this.membersService.getMembersByWorkspace(
        workspaceId
      );

      return ResponseHelper.success(
        res,
        members,
        "Workspace members retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };
}

export const membersController = new MembersController();
export { MembersController };

// Export individual methods untuk routes
export const getMembers = membersController.getMembers;
export const getMemberById = membersController.getMemberById;
export const addMember = membersController.addMember;
export const updateMember = membersController.updateMember;
export const removeMember = membersController.removeMember;
export const getMembersByWorkspace = membersController.getMembersByWorkspace;
