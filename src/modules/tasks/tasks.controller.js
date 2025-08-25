import { TasksService } from "./tasks.service.js";
import { asyncHandler } from "../../common/middlewares/error.js";

const tasksService = new TasksService();

export const getTasks = asyncHandler(async (req, res) => {
  const { workspaceId, status, assignTo, search } = req.query;

  const filters = {};
  if (workspaceId) filters.workspaceId = parseInt(workspaceId);
  if (status) filters.status = status;
  if (assignTo) filters.assignTo = parseInt(assignTo);
  if (search) filters.search = search;

  const result = await tasksService.getAllTasks(req.user, filters);
  res.status(200).json(result);
});

export const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await tasksService.getTaskById(parseInt(id), req.user);
  res.status(200).json(result);
});

export const getMyTasks = asyncHandler(async (req, res) => {
  const result = await tasksService.getMyTasks(req.user);
  res.status(200).json(result);
});

export const createTask = asyncHandler(async (req, res) => {
  const result = await tasksService.createTask(req.body, req.user);
  res.status(201).json(result);
});

export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await tasksService.updateTask(
    parseInt(id),
    req.body,
    req.user
  );
  res.status(200).json(result);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await tasksService.deleteTask(parseInt(id), req.user);
  res.status(200).json(result);
});
