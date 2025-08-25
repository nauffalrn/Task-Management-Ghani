import { AttachmentsService } from "./attachments.service.js";
import { asyncHandler } from "../../common/middlewares/error.js";

const attachmentsService = new AttachmentsService();

export const getTaskAttachments = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const result = await attachmentsService.getTaskAttachments(
    parseInt(taskId),
    req.user
  );
  res.status(200).json(result);
});

export const getAttachmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await attachmentsService.getAttachmentById(
    parseInt(id),
    req.user
  );
  res.status(200).json(result);
});

export const createAttachment = asyncHandler(async (req, res) => {
  const result = await attachmentsService.createAttachment(req.body, req.user);
  res.status(201).json(result);
});

export const deleteAttachment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await attachmentsService.deleteAttachment(
    parseInt(id),
    req.user
  );
  res.status(200).json(result);
});
