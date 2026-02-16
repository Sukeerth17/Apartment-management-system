import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { authStore } from "../services/authStore";
import { env } from "../config/env";
import { tokenService } from "../services/tokenService";
import { AppError } from "../utils/errors";
import { assertGmail } from "../utils/validators";

const generatePassword = () => Math.random().toString(36).slice(-10);

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { gmail, confirmGmail } = req.body as { gmail: string; confirmGmail: string };
      assertGmail(gmail);
      assertGmail(confirmGmail, "Confirm Gmail");

      if (gmail.toLowerCase() !== confirmGmail.toLowerCase()) {
        throw new AppError("Gmail and Confirm Gmail must match", 400);
      }

      // If the developer set SKIP_DB_CHECK, avoid touching the database so the
      // backend can run even when Postgres isn't available. This returns a
      // deterministic dev response (includes devPassword) but doesn't persist
      // a user — it's intended for frontend development only.
      const generatedPassword = generatePassword();
      if (env.skipDbCheck) {
        return res.status(201).json({ message: "Your password has been sent to your Gmail", devPassword: generatedPassword });
      }

      if (await authStore.findByGmail(gmail)) {
        throw new AppError("User already exists", 409);
      }

      const passwordHash = await bcrypt.hash(generatedPassword, 10);

      await authStore.create({ id: uuidv4(), gmail: gmail.toLowerCase(), passwordHash });

      return res.status(201).json({ message: "Your password has been sent to your Gmail", devPassword: generatedPassword });
    } catch (error) {
      return next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { gmail, password } = req.body as { gmail: string; password: string };
      assertGmail(gmail);

      const user = await authStore.findByGmail(gmail);
      if (!user) {
        throw new AppError("Invalid credentials", 401);
      }

      const match = await bcrypt.compare(password || "", user.passwordHash);
      if (!match) {
        throw new AppError("Invalid credentials", 401);
      }

      const token = tokenService.sign({ userId: user.id, gmail: user.gmail });
      return res.json({ token, user: { id: user.id, gmail: user.gmail } });
    } catch (error) {
      return next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { gmail } = req.body as { gmail: string };
      assertGmail(gmail);
      const user = await authStore.findByGmail(gmail);

      if (!user) {
        return res.json({ message: "Your password has been sent to your Gmail" });
      }

      const generatedPassword = generatePassword();
      const passwordHash = await bcrypt.hash(generatedPassword, 10);
      await authStore.updatePassword(user.id, passwordHash);

      return res.json({
        message: "Your password has been sent to your Gmail",
        devPassword: generatedPassword
      });
    } catch (error) {
      return next(error);
    }
  }
};
