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
  skipDbCheck: (process.env.SKIP_DB_CHECK === "1" || process.env.SKIP_DB_CHECK === "true"),
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "onboarding@resend.dev",
  // Optional: explicit path to the built frontend directory (relative to repo root or absolute).
  // Example: FRONTEND_DIST_PATH=frontend/dist or FRONTEND_DIST_PATH=../my-build
  frontendDistPath: process.env.FRONTEND_DIST_PATH || "frontend/dist",
  // Optional: when developing, you can point the backend to the running Vite dev server
  // to enable proxying unknown routes during development. Example: FRONTEND_DEV_URL=http://localhost:5173
  frontendDevUrl: process.env.FRONTEND_DEV_URL || "",
};
