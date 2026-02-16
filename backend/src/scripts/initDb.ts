import fs from "fs";
import path from "path";
import { db } from "../services/db";

const run = async () => {
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");
  await db.query(sql);
  console.log("Database schema initialized successfully.");
  await db.end();
};

run().catch(async (error) => {
  console.error("Failed to initialize database schema", error);
  await db.end();
  process.exit(1);
});
