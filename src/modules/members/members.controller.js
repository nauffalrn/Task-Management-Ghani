import { MembersService } from "./members.service.js";
import { asyncHandler } from "../../common/middlewares/error.js";

const membersService = new MembersService();

export const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const result = await membersService.getWorkspaceMembers(
    parseInt(workspaceId),
    req.user
  );
  res.status(200).json(result);
});

export const addMember = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const result = await membersService.addMember(
    parseInt(workspaceId),
    req.body,
    req.user
  );
  res.status(201).json(result);
});

export const updateMember = asyncHandler(async (req, res) => {
  const { workspaceId, userId } = req.params;
  const result = await membersService.updateMember(
    parseInt(workspaceId),
    parseInt(userId),
    req.body,
    req.user
  );
  res.status(200).json(result);
});

export const removeMember = asyncHandler(async (req, res) => {
  const { workspaceId, userId } = req.params;
  const result = await membersService.removeMember(
    parseInt(workspaceId),
    parseInt(userId),
    req.user
  );
  res.status(200).json(result);
});
