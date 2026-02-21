import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { env } from "./config/env";
import { authRoutes } from "./routes/authRoutes";
import { fileRoutes } from "./routes/fileRoutes";
import { errorMiddleware } from "./middleware/errorMiddleware";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// API routes
app.use("/auth", authRoutes);
app.use("/", fileRoutes);

// Serve frontend build if present (useful for running the built frontend via backend)
try {
  // Prefer explicit env path, otherwise try a list of common build folders
  const candidate = env.frontendDistPath || "frontend/dist";
  const candidates = [candidate, "frontend/dist", "frontend/build", "frontend/out", "build", "dist"];
  let clientDist: string | null = null;

  for (const c of candidates) {
    const abs = path.resolve(process.cwd(), c);
    if (fs.existsSync(abs)) {
      clientDist = abs;
      break;
    }
  }

  if (clientDist) {
    console.log(`Serving frontend from ${clientDist}`);
    app.use(express.static(clientDist));
    // send index.html for any unknown GET route (SPA fallback)
    app.get("*", (_req, res) => res.sendFile(path.join(clientDist as string, "index.html")));
  } else if (env.frontendDevUrl) {
    // If a frontend dev server (Vite) is running and FRONTEND_DEV_URL is set,
    // it's common to proxy requests during development. We don't enforce the
    // proxy here, but log a helpful note.
    console.log(`Frontend build not found; set FRONTEND_DEV_URL=${env.frontendDevUrl} and use a proxy if you want backend root to serve the dev server.`);
  }
} catch (err) {
  // ignore - serving frontend is optional
}

app.use(errorMiddleware);
