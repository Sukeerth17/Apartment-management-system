import { Pool } from "pg";
import { env } from "../config/env";

export const db = new Pool({
  connectionString: env.databaseUrl
});

export const checkDbConnection = async () => {
  const client = await db.connect();
  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
};
