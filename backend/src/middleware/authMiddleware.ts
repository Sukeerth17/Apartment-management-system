import { NextFunction, Request, Response } from "express";
import { tokenService } from "../services/tokenService";
import { AppError } from "../utils/errors";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; gmail: string };
    }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized", 401));
  }

  const token = header.replace("Bearer ", "").trim();

  try {
    req.user = tokenService.verify(token);
    return next();
  } catch {
    return next(new AppError("Invalid token", 401));
  }
};
