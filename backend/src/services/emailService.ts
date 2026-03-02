import { Resend } from "resend";
import { env } from "../config/env";

// ─────────────────────────────────────────────
//  Client
// ─────────────────────────────────────────────
const resend = new Resend(env.resendApiKey);

// ─────────────────────────────────────────────
//  Palette & tokens
// ─────────────────────────────────────────────
const color = {
  navy:       "#0f172a",
  navyLight:  "#1e293b",
  blue:       "#2563eb",
  blueLight:  "#3b82f6",
  blueMuted:  "#dbeafe",
  teal:       "#0d9488",
  tealLight:  "#ccfbf1",
  slate:      "#64748b",
  slateLight: "#f8fafc",
  border:     "#e2e8f0",
  text:       "#1e293b",
  muted:      "#94a3b8",
  white:      "#ffffff",
  warning:    "#f59e0b",
  danger:     "#ef4444",
  success:    "#10b981",
};

const font = {
  base: `'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif`,
  mono: `'Courier New', Courier, monospace`,
};

// ─────────────────────────────────────────────
//  Shared layout helpers
// ─────────────────────────────────────────────
const wrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Water Billing Portal</title>
</head>
<body style="
  margin: 0; padding: 0;
  background: ${color.slateLight};
  font-family: ${font.base};
">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${color.slateLight}; padding: 40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="
        background: ${color.white};
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 32px rgba(15,23,42,.10);
        border: 1px solid ${color.border};
      ">
        ${header()}
        <tr><td style="padding: 32px 40px;">${content}</td></tr>
        ${footer()}
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

const header = () => `
<tr>
  <td style="
    background: linear-gradient(135deg, ${color.navy} 0%, ${color.navyLight} 60%, ${color.blue} 100%);
    padding: 32px 40px 28px;
  ">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <div style="
            display:inline-block;
            background: rgba(255,255,255,.12);
            border-radius: 10px;
            padding: 8px 14px;
            margin-bottom: 14px;
          ">
            <span style="font-size:20px;">💧</span>
          </div>
          <div style="color:${color.white}; font-size:22px; font-weight:700; letter-spacing:-.3px;">
            Water Billing Portal
          </div>
          <div style="color: rgba(255,255,255,.55); font-size:13px; margin-top:4px;">
            Secure Account Services
          </div>
        </td>
        <td align="right" style="vertical-align:top;">
          <div style="
            background: ${color.teal};
            color: ${color.white};
            font-size:11px;
            font-weight:600;
            letter-spacing:.8px;
            text-transform:uppercase;
            padding: 5px 12px;
            border-radius: 20px;
          ">Official</div>
        </td>
      </tr>
    </table>
  </td>
</tr>`;

const footer = () => `
<tr>
  <td style="
    background: ${color.slateLight};
    border-top: 1px solid ${color.border};
    padding: 20px 40px;
  ">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="color:${color.muted}; font-size:11px; line-height:1.6;">
          © ${new Date().getFullYear()} Water Billing Portal. All rights reserved.<br/>
          This is an automated message — please do not reply.
        </td>
        <td align="right">
          <span style="font-size:18px; opacity:.35;">💧</span>
        </td>
      </tr>
    </table>
  </td>
</tr>`;

// ─────────────────────────────────────────────
//  Reusable blocks
// ─────────────────────────────────────────────
const divider = () => `
<div style="
  border-top: 1px solid ${color.border};
  margin: 24px 0;
"></div>`;

const badge = (label: string, bg: string, fg: string) => `
<span style="
  background:${bg}; color:${fg};
  font-size:11px; font-weight:600;
  letter-spacing:.6px; text-transform:uppercase;
  padding: 3px 10px; border-radius:20px;
">${label}</span>`;

const infoRow = (label: string, value: string) => `
<tr>
  <td style="
    color:${color.slate}; font-size:13px;
    padding: 8px 0; border-bottom:1px solid ${color.border};
    width:140px;
  ">${label}</td>
  <td style="
    color:${color.text}; font-size:13px; font-weight:600;
    padding: 8px 0; border-bottom:1px solid ${color.border};
  ">${value}</td>
</tr>`;

const alertBox = (icon: string, text: string, bg: string, border: string) => `
<div style="
  background:${bg};
  border-left: 4px solid ${border};
  border-radius: 8px;
  padding: 14px 16px;
  margin: 20px 0;
  display:flex; gap:10px;
">
  <span style="font-size:16px; flex-shrink:0;">${icon}</span>
  <span style="color:${color.text}; font-size:13px; line-height:1.6;">${text}</span>
</div>`;

const passwordBox = (password: string) => `
<div style="
  background: linear-gradient(135deg, ${color.navy} 0%, ${color.navyLight} 100%);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin: 24px 0;
  position: relative;
">
  <div style="color: rgba(255,255,255,.5); font-size:11px; letter-spacing:1.2px; text-transform:uppercase; margin-bottom:10px;">
    Your Temporary Password
  </div>
  <div style="
    font-family: ${font.mono};
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 6px;
    color: ${color.white};
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 8px;
    padding: 14px 24px;
    display: inline-block;
    word-break: break-all;
  ">${password}</div>
  <div style="color: rgba(255, 255, 255, 1); font-size:11px; margin-top:10px;">
    Copy this exactly — case sensitive
  </div>
</div>`;

const stepsBlock = (steps: { icon: string; title: string; desc: string }[]) => `
<div style="margin: 20px 0;">
  ${steps.map((s, i) => `
  <div style="display:flex; gap:14px; align-items:flex-start; margin-bottom:${i < steps.length - 1 ? "18px" : "0"};">
    <div style="
      background: ${color.blueMuted};
      color: ${color.blue};
      border-radius: 50%;
      width:32px; height:32px;
      font-size:14px;
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0; font-weight:700;
    ">${i + 1}</div>
    <div>
      <div style="color:${color.text}; font-size:14px; font-weight:600; margin-bottom:2px;">${s.title}</div>
      <div style="color:${color.slate}; font-size:13px; line-height:1.5;">${s.desc}</div>
    </div>
  </div>`).join("")}
</div>`;

// ─────────────────────────────────────────────
//  Email templates
// ─────────────────────────────────────────────
const templates = {

  sendPassword: (toGmail: string, password: string) => wrapper(`
    <div style="margin-bottom:6px;">
      ${badge("Account Access", color.blueMuted, color.blue)}
    </div>
    <h2 style="color:${color.text}; font-size:20px; font-weight:700; margin:12px 0 4px;">
      Your login credentials are ready
    </h2>
    <p style="color:${color.slate}; font-size:14px; line-height:1.6; margin:0 0 8px;">
      An account has been created for <strong>${toGmail}</strong>.
      Use the password below to sign in.
    </p>

    ${passwordBox(password)}

    ${alertBox("🔒", "Never share this password. Our team will never ask for it via email or phone.", color.tealLight, color.teal)}

    <p style="color:${color.slate}; font-size:13px; font-weight:600; margin:20px 0 10px;">
      Getting started:
    </p>
    ${stepsBlock([
      { icon:"1", title:"Visit the Portal", desc:"Open the Water Billing Portal login page in your browser." },
      { icon:"2", title:"Enter Your Credentials", desc:`Use ${toGmail} as your email and the password above.` },
      { icon:"3", title:"Change Your Password", desc:"Go to Account Settings and update to a personal password immediately." },
    ])}

    ${divider()}
    <p style="color:${color.muted}; font-size:12px; line-height:1.6; margin:0;">
      If you did not request this account, please contact support immediately.
    </p>
  `),

  sendBillReminder: (toGmail: string, amount: string, dueDate: string) => wrapper(`
    <div style="margin-bottom:6px;">
      ${badge("Bill Due", "#fef3c7", color.warning)}
    </div>
    <h2 style="color:${color.text}; font-size:20px; font-weight:700; margin:12px 0 4px;">
      Payment reminder
    </h2>
    <p style="color:${color.slate}; font-size:14px; line-height:1.6; margin:0 0 20px;">
      Your water bill is due soon. Please settle your balance to avoid service interruption.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${infoRow("Account Email", toGmail)}
      ${infoRow("Amount Due", amount)}
      ${infoRow("Due Date", dueDate)}
      ${infoRow("Status", "Pending")}
    </table>

    ${alertBox("⚠️", "Late payments may incur additional fees or temporary service suspension.", "#fef3c7", color.warning)}

    <div style="text-align:center; margin-top:24px;">
      <a href="#" style="
        background: linear-gradient(135deg, ${color.blue}, ${color.teal});
        color:${color.white};
        text-decoration:none;
        padding: 13px 32px;
        border-radius: 8px;
        font-size:14px;
        font-weight:600;
        display:inline-block;
        letter-spacing:.3px;
      ">Pay Now →</a>
    </div>
  `),

  sendConfirmation: (toGmail: string, refNo: string, amount: string) => wrapper(`
    <div style="margin-bottom:6px;">
      ${badge("Payment Received", color.tealLight, color.teal)}
    </div>
    <div style="text-align:center; margin: 20px 0;">
      <div style="font-size:48px;">✅</div>
      <h2 style="color:${color.text}; font-size:20px; font-weight:700; margin:8px 0 4px;">
        Payment confirmed!
      </h2>
      <p style="color:${color.slate}; font-size:14px; margin:0;">
        Thank you. Your transaction has been recorded.
      </p>
    </div>

    ${divider()}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
      ${infoRow("Account", toGmail)}
      ${infoRow("Reference No.", refNo)}
      ${infoRow("Amount Paid", amount)}
      ${infoRow("Date", new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" }))}
    </table>

    ${alertBox("📄", "Keep your reference number for future inquiries. A receipt has been attached to this email.", color.blueMuted, color.blue)}
  `),

};

// ─────────────────────────────────────────────
//  Service
// ─────────────────────────────────────────────
export const emailService = {

  async sendPassword(toGmail: string, password: string): Promise<void> {
    if (!env.resendApiKey) {
      console.log(`[DEV] Password for ${toGmail}: ${password}`);
      return;
    }
    await resend.emails.send({
      from:    env.emailFrom,
      to:      toGmail,
      subject: "Your Water Billing Portal Password",
      html:    templates.sendPassword(toGmail, password),
    });
  },

  async sendBillReminder(toGmail: string, amount: string, dueDate: string): Promise<void> {
    if (!env.resendApiKey) {
      console.log(`[DEV] Bill reminder → ${toGmail} | ${amount} due ${dueDate}`);
      return;
    }
    await resend.emails.send({
      from:    env.emailFrom,
      to:      toGmail,
      subject: `Bill Reminder — ${amount} due ${dueDate}`,
      html:    templates.sendBillReminder(toGmail, amount, dueDate),
    });
  },

  async sendPaymentConfirmation(toGmail: string, refNo: string, amount: string): Promise<void> {
    if (!env.resendApiKey) {
      console.log(`[DEV] Confirmation → ${toGmail} | Ref: ${refNo} | ${amount}`);
      return;
    }
    await resend.emails.send({
      from:    env.emailFrom,
      to:      toGmail,
      subject: `Payment Confirmed — Ref #${refNo}`,
      html:    templates.sendConfirmation(toGmail, refNo, amount),
    });
  },

};