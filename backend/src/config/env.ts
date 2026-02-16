import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  // Default to localhost:5433 to match docker-compose mapping (host -> container 5433:5432).
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5433/water_billing",
  // When true ("1" or "true"), the server will start without verifying DB connectivity.
  // Useful for local frontend development when a database isn't available.
  skipDbCheck: (process.env.SKIP_DB_CHECK === "1" || process.env.SKIP_DB_CHECK === "true")
};
