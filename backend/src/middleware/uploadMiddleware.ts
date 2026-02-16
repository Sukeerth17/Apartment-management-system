import fs from "fs";
import path from "path";
import multer from "multer";
import { AppError } from "../utils/errors";

const uploadDir = path.join(process.cwd(), "storage", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const stamp = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${stamp}-${file.originalname.replace(/\s+/g, "-")}`);
  }
});

export const uploadMiddleware = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const isXlsx = file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.originalname.endsWith(".xlsx");
    if (!isXlsx) {
      return cb(new AppError("Invalid file. Only .xlsx is allowed", 400));
    }
    return cb(null, true);
  }
});
