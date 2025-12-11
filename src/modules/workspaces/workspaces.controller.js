import { BaseController } from "../../common/controller/base.controller.js";
import { WorkspacesService } from "./workspaces.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";

class WorkspacesController extends BaseController {
  constructor() {
    super();
    this.workspacesService = new WorkspacesService();
  }

  // GET /api/workspaces - List all workspaces
  getWorkspaces = async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const userId = req.user.userId; // For filtering user's workspaces if needed

      const workspaces = await this.workspacesService.getAllWorkspaces({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        userId:
          req.user.role === "owner" || req.user.role === "manager"
            ? undefined
            : userId,
      });

      return ResponseHelper.success(
        res,
        workspaces,
        "Workspaces retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/workspaces/:id - Get workspace by ID
  getWorkspaceById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const workspace = await this.workspacesService.getWorkspaceById(id);

      return ResponseHelper.success(
        res,
        workspace,
        "Workspace retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // POST /api/workspaces - Create workspace
  createWorkspace = async (req, res, next) => {
    try {
      const workspaceData = req.body;
      const userId = req.user.userId;

      const workspace = await this.workspacesService.createWorkspace(
        workspaceData,
        userId
      );

      return ResponseHelper.created(
        res,
        workspace,
        "Workspace created successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/workspaces/:id - Update workspace
  updateWorkspace = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;

      const workspace = await this.workspacesService.updateWorkspace(
        id,
        updateData,
        userId
      );

      return ResponseHelper.success(
        res,
        workspace,
        "Workspace updated successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/workspaces/:id - Delete workspace
  deleteWorkspace = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await this.workspacesService.deleteWorkspace(id, userId);

      return ResponseHelper.success(
        res,
        null,
        "Workspace deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/workspaces/my - Get current user's workspaces
  getMyWorkspaces = async (req, res, next) => {
    try {
      const userId = req.user.userId;

      const workspaces = await this.workspacesService.getUserWorkspaces(userId);

      return ResponseHelper.success(
        res,
        workspaces,
        "User workspaces retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };
}

export const workspacesController = new WorkspacesController();
export { WorkspacesController };

// Export individual methods untuk routes
export const getWorkspaces = workspacesController.getWorkspaces;
export const getWorkspaceById = workspacesController.getWorkspaceById;
export const createWorkspace = workspacesController.createWorkspace;
export const updateWorkspace = workspacesController.updateWorkspace;
export const deleteWorkspace = workspacesController.deleteWorkspace;
export const getMyWorkspaces = workspacesController.getMyWorkspaces;
