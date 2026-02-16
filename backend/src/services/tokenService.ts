import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const tokenService = {
  sign(payload: { userId: string; gmail: string }) {
    return jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"]
    });
  },
  verify(token: string) {
    return jwt.verify(token, env.jwtSecret) as { userId: string; gmail: string };
  }
};
