import multer from "multer";
import path from "path";
import fs from "fs";
import { FILE_LIMITS } from "../constants/app.js";
import { ResponseHelper } from "../utils/response.helper.js";

// Ensure upload directory exists
const ensureUploadDir = (uploadPath) => {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "public", "uploads", "tasks");
    ensureUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

const fileFilter = (req, file, cb) => {
  const isValidType = FILE_LIMITS.ALLOWED_TYPES.includes(file.mimetype);
  const extension = path.extname(file.originalname).toLowerCase();
  const isValidExtension = FILE_LIMITS.ALLOWED_EXTENSIONS.includes(extension);

  if (isValidType && isValidExtension) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${FILE_LIMITS.ALLOWED_TYPES.join(
          ", "
        )}`
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_LIMITS.MAX_SIZE,
  },
});

export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return ResponseHelper.badRequest(
        res,
        `File too large. Maximum size allowed is ${
          FILE_LIMITS.MAX_SIZE / (1024 * 1024)
        }MB`
      );
    }
    return ResponseHelper.badRequest(res, error.message);
  }

  if (error.message.includes("Invalid file type")) {
    return ResponseHelper.badRequest(res, error.message);
  }

  next(error);
};
