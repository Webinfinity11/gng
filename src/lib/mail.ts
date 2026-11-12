import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/** SMTP is configured from the mailbox that sends the notifications (info@gnginner.ge on liberty.hosthp.net, port 465 SSL). */
export function isMailConfigured() {
  return ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"].every(key => Boolean(process.env[key]));
}

let transport: Transporter | undefined;
function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 587);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port, secure: port === 465, requireTLS: port !== 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000,
    });
  }
  return transport;
}

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));

export type InquiryMail = { name: string; email: string; phone: string; message: string; locale: string };

/** Sends a new contact-form message to the company inbox; Reply-To is the visitor. */
export async function sendInquiryMail(inquiry: InquiryMail) {
  const to = process.env.CONTACT_MAIL_TO || "info@gnginner.ge";
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const rows: [string, string][] = [["სახელი", inquiry.name], ["ელფოსტა", inquiry.email], ["ტელეფონი", inquiry.phone || "-"], ["ენა", inquiry.locale === "en" ? "English" : "ქართული"]];
  // Header values are single-line: strip any line breaks a visitor might include.
  const subject = `ახალი შეტყობინება საიტიდან - ${inquiry.name}`.replace(/[\r\n]+/g, " ").slice(0, 160);
  await getTransport().sendMail({
    from: { name: "GNG საიტი", address: from },
    to,
    replyTo: { name: inquiry.name.replace(/[\r\n"]+/g, " "), address: inquiry.email },
    subject,
    text: `${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n${inquiry.message}\n\n— პასუხისთვის უბრალოდ დააჭირეთ „Reply“-ს.`,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#161513">
      <h2 style="font-size:18px;margin:0 0 16px">ახალი შეტყობინება საიტიდან</h2>
      <table style="border-collapse:collapse;margin-bottom:16px">${rows.map(([label, value]) => `<tr><td style="padding:4px 16px 4px 0;color:#777">${label}</td><td style="padding:4px 0"><strong>${escape(value)}</strong></td></tr>`).join("")}</table>
      <div style="white-space:pre-wrap;padding:16px;background:#f4f1ec;border-radius:8px">${escape(inquiry.message)}</div>
      <p style="color:#777;font-size:12px;margin-top:16px">პასუხისთვის უბრალოდ დააჭირეთ „Reply“-ს - წერილი გამგზავნს მიუვა.</p>
    </div>`,
  });
}
