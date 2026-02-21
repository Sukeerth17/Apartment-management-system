import { Resend } from "resend";
import { env } from "../config/env";

const resend = new Resend(env.resendApiKey);

export const emailService = {
  async sendPassword(toGmail: string, password: string): Promise<void> {
    if (!env.resendApiKey) {
      // Fallback: just log if no key configured (dev mode)
      console.log(`[DEV] Password for ${toGmail}: ${password}`);
      return;
    }

    await resend.emails.send({
      from: env.emailFrom,
      to: toGmail,
      subject: "Your Water Billing Portal Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1d4ed8; margin-bottom: 8px;">Water Billing Portal</h2>
          <p style="color: #374151;">Your account password is:</p>
          <div style="background: #f3f4f6; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0;">
            <code style="font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #111827;">${password}</code>
          </div>
          <p style="color: #6b7280; font-size: 13px;">Please log in and keep this password safe. Do not share it with anyone.</p>
        </div>
      `
    });
  }
};