import { Router } from "express";
import { fileController } from "../controllers/fileController";
import { authMiddleware } from "../middleware/authMiddleware";
import { uploadMiddleware } from "../middleware/uploadMiddleware";

export const fileRoutes = Router();

fileRoutes.post("/upload", authMiddleware, uploadMiddleware.single("file"), fileController.upload);
fileRoutes.post("/process", authMiddleware, fileController.process);
fileRoutes.get("/summary/:fileId", authMiddleware, fileController.summary);
fileRoutes.get("/download/:fileId", authMiddleware, fileController.download);
