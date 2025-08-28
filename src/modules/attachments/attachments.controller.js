import { AttachmentsService } from "./attachments.service.js";

const attachmentsService = new AttachmentsService();

export const getTaskAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await attachmentsService.getTaskAttachments(
      parseInt(taskId)
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAttachmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await attachmentsService.getAttachmentById(parseInt(id));
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE: Handle file upload properly
export const createAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const file = req.file; // From multer middleware
    const userId = req.user.id; // From auth middleware

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    const result = await attachmentsService.uploadFile(
      file,
      parseInt(taskId),
      userId
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await attachmentsService.deleteAttachment(
      parseInt(id),
      userId
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
