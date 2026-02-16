import { app } from "./app";
import { env } from "./config/env";
import { checkDbConnection } from "./services/db";

const start = async () => {
  try {
    if (!env.skipDbCheck) {
      await checkDbConnection();
    } else {
      console.log("SKIP_DB_CHECK is set — skipping database connection test.");
    }

    app.listen(env.port, () => {
      console.log(`Water Billing backend running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server. PostgreSQL connection failed.", error);
    process.exit(1);
  }
};

void start();
