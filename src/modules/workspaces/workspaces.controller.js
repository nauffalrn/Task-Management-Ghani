import { BaseController } from "../../common/controller/base.controller.js";
import { WorkspacesService } from "./workspaces.service.js";
import { ResponseHelper } from "../../common/utils/response.helper.js";

export class WorkspacesController extends BaseController {
  constructor() {
    const workspacesService = new WorkspacesService();
    super(workspacesService, "Workspace");
  }

  async getWorkspaces(req, res, next) {
    try {
      const { search } = req.query;
      const workspaces = await this.service.getAllWorkspaces(req.user, search);

      return ResponseHelper.success(
        res,
        workspaces,
        "Workspaces retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Override getById to use custom method
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const workspace = await this.service.getById(parseInt(id), req.user);

      return ResponseHelper.success(
        res,
        workspace,
        "Workspace retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Override create to add user context
  async create(req, res, next) {
    try {
      const workspace = await this.service.create(req.body, req.user);

      return ResponseHelper.created(
        res,
        workspace,
        "Workspace created successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Override update to add user context
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const workspace = await this.service.update(
        parseInt(id),
        req.body,
        req.user
      );

      if (!workspace) {
        return ResponseHelper.notFound(res, "Workspace not found");
      }

      return ResponseHelper.success(
        res,
        workspace,
        "Workspace updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Override delete to add user context
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const workspace = await this.service.delete(parseInt(id), req.user);

      if (!workspace) {
        return ResponseHelper.notFound(res, "Workspace not found");
      }

      return ResponseHelper.success(
        res,
        null,
        "Workspace deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceStats(req, res, next) {
    try {
      const { id } = req.params;
      const stats = await this.service.getWorkspaceStats(
        parseInt(id),
        req.user
      );

      return ResponseHelper.success(
        res,
        stats,
        "Workspace statistics retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}

// Export individual functions for routes
const controller = new WorkspacesController();

export const getWorkspaces = (req, res, next) =>
  controller.getWorkspaces(req, res, next);

export const getWorkspaceById = (req, res, next) =>
  controller.getById(req, res, next);

export const createWorkspace = (req, res, next) =>
  controller.create(req, res, next);

export const updateWorkspace = (req, res, next) =>
  controller.update(req, res, next);

export const deleteWorkspace = (req, res, next) =>
  controller.delete(req, res, next);

export const getWorkspaceStats = (req, res, next) =>
  controller.getWorkspaceStats(req, res, next);
