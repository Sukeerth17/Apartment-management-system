import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileStore } from "../services/fileStore";
import { aiExcelService } from "../services/aiExcelService";
import { AppError } from "../utils/errors";

export const fileController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError("File is required", 400);
      }
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const fileId = uuidv4();
      await fileStore.createUpload({
        id: fileId,
        userId: req.user.userId,
        originalFileName: req.file.originalname,
        storedPath: req.file.path
      });

      return res.status(201).json({
        fileId,
        fileName: req.file.originalname,
        message: "File uploaded successfully"
      });
    } catch (error) {
      return next(error);
    }
  },

  async process(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId, costPerUnit, fixedMaintenanceCharge } = req.body as {
        fileId: string;
        costPerUnit?: number;
        fixedMaintenanceCharge?: number;
      };

      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }
      if (!fileId) {
        throw new AppError("fileId is required", 400);
      }

      const upload = await fileStore.getUpload(fileId, req.user.userId);
      if (!upload || !fs.existsSync(upload.storedPath)) {
        throw new AppError("Uploaded file not found", 404);
      }

      const result = await aiExcelService.process(upload.storedPath, {
        costPerUnit: costPerUnit !== undefined && costPerUnit !== null ? Number(costPerUnit) : undefined,
        fixedMaintenanceCharge:
          fixedMaintenanceCharge !== undefined && fixedMaintenanceCharge !== null
            ? Number(fixedMaintenanceCharge)
            : undefined
      });

      await fileStore.createProcessed({
        ...result,
        sourceUploadId: upload.id,
        userId: req.user.userId
      });

      return res.json({
        fileId: result.fileId,
        rows: result.rows,
        summary: result.summary,
        extracted: result.extracted,
        calculated: result.calculated,
        downloadUrl: `/download/${result.fileId}`
      });
    } catch (error) {
      return next(error);
    }
  },

  async summary(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const rawFileId = req.params.fileId;
      const fileId = Array.isArray(rawFileId) ? rawFileId[0] : rawFileId;
      if (!fileId) throw new AppError("fileId is required", 400);

      const result = await fileStore.getProcessed(String(fileId), req.user.userId);
      if (!result) {
        throw new AppError("Processed file not found", 404);
      }

      return res.json({ fileId, summary: result.summary, rows: result.rows });
    } catch (error) {
      return next(error);
    }
  },

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const rawFileId = req.params.fileId;
      const fileId = Array.isArray(rawFileId) ? rawFileId[0] : rawFileId;
      if (!fileId) throw new AppError("fileId is required", 400);

      const result = await fileStore.getProcessed(String(fileId), req.user.userId);
      if (!result || !fs.existsSync(result.outputPath)) {
        throw new AppError("Processed file not found", 404);
      }

      const downloadName = `billing-report-${fileId}.xlsx`;
      return res.download(path.resolve(result.outputPath), downloadName);
    } catch (error) {
      return next(error);
    }
  }
};
