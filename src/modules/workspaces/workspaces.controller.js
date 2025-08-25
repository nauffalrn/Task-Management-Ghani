import { WorkspacesService } from "./workspaces.service.js";
import { asyncHandler } from "../../common/middlewares/error.js";

const workspacesService = new WorkspacesService();

export const getWorkspaces = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const result = await workspacesService.getAllWorkspaces(req.user, search);
  res.status(200).json(result);
});

export const getWorkspaceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await workspacesService.getWorkspaceById(
    parseInt(id),
    req.user
  );
  res.status(200).json(result);
});

export const createWorkspace = asyncHandler(async (req, res) => {
  const result = await workspacesService.createWorkspace(req.body, req.user);
  res.status(201).json(result);
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await workspacesService.updateWorkspace(
    parseInt(id),
    req.body,
    req.user
  );
  res.status(200).json(result);
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await workspacesService.deleteWorkspace(
    parseInt(id),
    req.user
  );
  res.status(200).json(result);
});
