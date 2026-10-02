import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | undefined;

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD are not set.");
  return (transporter ??= nodemailer.createTransport({ service: "gmail", auth: { user, pass } }));
}

export async function sendMail(opts: { to: string; subject: string; html: string; text: string }) {
  await getTransporter().sendMail({
    from: `"Project Accomplishment Tracker" <${process.env.GMAIL_USER}>`,
    ...opts,
  });
}
