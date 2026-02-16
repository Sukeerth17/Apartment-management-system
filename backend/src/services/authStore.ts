import { db } from "./db";
import { User } from "../types";

export const authStore = {
  async findByGmail(gmail: string): Promise<User | null> {
    const result = await db.query<User>(
      `SELECT id, gmail, password_hash AS "passwordHash"
       FROM users
       WHERE gmail = $1`,
      [gmail.toLowerCase()]
    );
    return result.rows[0] || null;
  },

  async create(user: User): Promise<void> {
    await db.query(
      `INSERT INTO users (id, gmail, password_hash)
       VALUES ($1, $2, $3)`,
      [user.id, user.gmail.toLowerCase(), user.passwordHash]
    );
  },

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await db.query(
      `UPDATE users
       SET password_hash = $2, updated_at = NOW()
       WHERE id = $1`,
      [userId, passwordHash]
    );
  }
};
