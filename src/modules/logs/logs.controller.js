import { LogsService } from "./logs.service.js";
import { asyncHandler } from "../../common/middlewares/error.js";

const logsService = new LogsService();

export const getLogs = asyncHandler(async (req, res) => {
  const { workspaceId, userId, taskId } = req.query;

  const filters = {};
  if (workspaceId) filters.workspaceId = parseInt(workspaceId);
  if (userId) filters.userId = parseInt(userId);
  if (taskId) filters.taskId = parseInt(taskId);

  const result = await logsService.getAllLogs(req.user, filters);
  res.status(200).json(result);
});

export const getWorkspaceLogs = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const result = await logsService.getWorkspaceLogs(
    parseInt(workspaceId),
    req.user
  );
  res.status(200).json(result);
});

export const createLog = asyncHandler(async (req, res) => {
  const result = await logsService.createLog(req.body);
  res.status(201).json(result);
});
