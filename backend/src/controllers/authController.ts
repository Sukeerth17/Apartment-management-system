import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { authStore } from "../services/authStore";
import { env } from "../config/env";
import { tokenService } from "../services/tokenService";
import { AppError } from "../utils/errors";
import { assertGmail } from "../utils/validators";
import { emailService } from "../services/emailService";

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

      if (env.skipDbCheck) {
        const devPassword = generatePassword();
        await emailService.sendPassword(gmail, devPassword);
        return res.status(201).json({ message: "Your password has been sent to your Gmail", devPassword });
      }

      if (await authStore.findByGmail(gmail)) {
        throw new AppError("User already exists", 409);
      }

      const generatedPassword = generatePassword();
      const passwordHash = await bcrypt.hash(generatedPassword, 10);

      await authStore.create({ id: uuidv4(), gmail: gmail.toLowerCase(), passwordHash });
      await emailService.sendPassword(gmail, generatedPassword);

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

      if (env.skipDbCheck) {
        const devPassword = generatePassword();
        await emailService.sendPassword(gmail, devPassword);
        return res.json({ message: "Your password has been sent to your Gmail", devPassword });
      }

      const user = await authStore.findByGmail(gmail);
      // For security, always return a generic message even if the user does not exist
      if (!user) {
        return res.json({ message: "Your password has been sent to your Gmail" });
      }

      const newPassword = generatePassword();
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await authStore.updatePassword(user.id, passwordHash);
      await emailService.sendPassword(gmail, newPassword);

      return res.json({ message: "Your password has been sent to your Gmail", devPassword: newPassword });
    } catch (error) {
      return next(error);
    }
  }
};
