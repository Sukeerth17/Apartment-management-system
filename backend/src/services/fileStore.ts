import { db } from "./db";
import { BillingRow, BillingSummary, ProcessResult, ProcessedRecord, UploadRecord } from "../types";

export const fileStore = {
  async createUpload(record: {
    id: string;
    userId: string;
    originalFileName: string;
    storedPath: string;
  }): Promise<void> {
    await db.query(
      `INSERT INTO uploads (id, user_id, original_file_name, stored_path)
       VALUES ($1, $2, $3, $4)`,
      [record.id, record.userId, record.originalFileName, record.storedPath]
    );
  },

  async getUpload(fileId: string, userId: string): Promise<UploadRecord | null> {
    const result = await db.query<UploadRecord>(
      `SELECT id,
              user_id AS "userId",
              original_file_name AS "originalFileName",
              stored_path AS "storedPath",
              created_at AS "createdAt"
       FROM uploads
       WHERE id = $1 AND user_id = $2`,
      [fileId, userId]
    );
    return result.rows[0] || null;
  },

  async createProcessed(result: ProcessResult & { sourceUploadId: string; userId: string }): Promise<void> {
    await db.query(
      `INSERT INTO processed_files (id, source_upload_id, user_id, output_path, rows_json, summary_json)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)`,
      [result.fileId, result.sourceUploadId, result.userId, result.outputPath, JSON.stringify(result.rows), JSON.stringify(result.summary)]
    );
  },

  async getProcessed(fileId: string, userId: string): Promise<ProcessedRecord | null> {
    const result = await db.query<{
      id: string;
      sourceUploadId: string;
      userId: string;
      outputPath: string;
      rows: BillingRow[];
      summary: BillingSummary;
      createdAt: string;
    }>(
      `SELECT id,
              source_upload_id AS "sourceUploadId",
              user_id AS "userId",
              output_path AS "outputPath",
              rows_json AS "rows",
              summary_json AS "summary",
              created_at AS "createdAt"
       FROM processed_files
       WHERE id = $1 AND user_id = $2`,
      [fileId, userId]
    );

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      sourceUploadId: row.sourceUploadId,
      userId: row.userId,
      outputPath: row.outputPath,
      rows: row.rows,
      summary: row.summary,
      createdAt: row.createdAt
    };
  }
};
