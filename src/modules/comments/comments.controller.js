import { CommentsService } from "./comments.service.js";
import { asyncHandler } from "../../common/middlewares/error.js";

const commentsService = new CommentsService();

export const getTaskComments = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const result = await commentsService.getTaskComments(
    parseInt(taskId),
    req.user
  );
  res.status(200).json(result);
});

export const createComment = asyncHandler(async (req, res) => {
  const result = await commentsService.createComment(req.body, req.user);
  res.status(201).json(result);
});

export const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await commentsService.updateComment(
    parseInt(id),
    req.body,
    req.user
  );
  res.status(200).json(result);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await commentsService.deleteComment(parseInt(id), req.user);
  res.status(200).json(result);
});
