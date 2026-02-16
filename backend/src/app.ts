import express from "express";
import cors from "cors";
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

app.use("/auth", authRoutes);
app.use("/", fileRoutes);

app.use(errorMiddleware);
