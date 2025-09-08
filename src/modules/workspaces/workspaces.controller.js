import { BaseController } from "../../common/controller/base.controller.js";
import { WorkspacesService } from "./workspaces.service.js";

class WorkspacesController extends BaseController {
  constructor() {
    super();
    this.workspacesService = new WorkspacesService();
  }

  getAllWorkspaces = async (req, res) => {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const result = await this.workspacesService.getAllWorkspaces({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Workspaces retrieved successfully",
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

  getWorkspaceById = async (req, res) => {
    try {
      const { id } = req.params;

      const workspace = await this.workspacesService.getWorkspaceById(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Workspace retrieved successfully",
        workspace
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  createWorkspace = async (req, res) => {
    try {
      const workspaceData = req.body;

      const workspace = await this.workspacesService.createWorkspace(
        workspaceData,
        {
          requesterId: req.user.id,
          requesterRole: req.user.role,
        }
      );

      return this.sendSuccessResponse(
        res,
        "Workspace created successfully",
        workspace,
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

  updateWorkspace = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const workspace = await this.workspacesService.updateWorkspace(
        id,
        updateData,
        {
          requesterId: req.user.id,
          requesterRole: req.user.role,
        }
      );

      return this.sendSuccessResponse(
        res,
        "Workspace updated successfully",
        workspace
      );
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  deleteWorkspace = async (req, res) => {
    try {
      const { id } = req.params;

      await this.workspacesService.deleteWorkspace(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(res, "Workspace deleted successfully");
    } catch (error) {
      return this.sendErrorResponse(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  };

  getWorkspaceStats = async (req, res) => {
    try {
      const { id } = req.params;

      const stats = await this.workspacesService.getWorkspaceStats(id, {
        requesterId: req.user.id,
        requesterRole: req.user.role,
      });

      return this.sendSuccessResponse(
        res,
        "Workspace statistics retrieved successfully",
        stats
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

const workspacesController = new WorkspacesController();

export const {
  getAllWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceStats,
} = workspacesController;
