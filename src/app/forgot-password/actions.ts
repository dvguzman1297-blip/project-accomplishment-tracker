"use server";
import { z } from "zod";
import { sendMail } from "@/lib/mailer";
import { createAdminClient } from "@/lib/supabase/admin";

type State = { error?: string; success?: string };

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function requestReset(_prev: State, formData: FormData): Promise<State> {
  const parsed = z.string().trim().toLowerCase().email("Enter a valid email address.").safeParse(formData.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const email = parsed.data;

  try {
    const { data, error } = await createAdminClient().auth.admin.generateLink({ type: "recovery", email });
    if (error) {
      if (error.status === 404 || /not.?found/i.test(`${error.code} ${error.message}`)) {
        return { error: "We couldn't find an account associated with that email." };
      }
      return { error: error.message };
    }

    const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const link = `${base}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery`;
    await sendMail({
      to: email,
      subject: "Reset your password",
      text: `Reset your password for the Project Accomplishment Tracker:\n\n${link}\n\nIf you didn't request this, ignore this email.`,
      html: `<p>Reset your password for the Project Accomplishment Tracker:</p>
<p><a href="${escapeHtml(link)}">Reset my password</a></p>
<p style="color:#666;font-size:12px">If you didn't request this, ignore this email.</p>`,
    });
  } catch (e) {
    console.error("password reset failed", e);
    return { error: "We couldn't send the reset email. Try again later." };
  }
  return { success: "We sent a password reset link to your inbox." };
}
