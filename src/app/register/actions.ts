"use server";
import { z } from "zod";
import { sendMail } from "@/lib/mailer";
import { createAdminClient } from "@/lib/supabase/admin";

type State = { error?: string; success?: string };

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(80, "Name is too long."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match.", path: ["confirm"] });

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function register(_prev: State, formData: FormData): Promise<State> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password } = parsed.data;

  // Optional allow-list, e.g. REGISTER_ALLOWED_DOMAINS=pimes.com.ph,example.com
  const allowed = (process.env.REGISTER_ALLOWED_DOMAINS ?? "").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  if (allowed.length && !allowed.includes(email.split("@")[1])) {
    return { error: "Registration is limited to approved email domains." };
  }

  try {
    // Creates the (unconfirmed) user and returns a verification link we email ourselves via Resend.
    const { data, error } = await createAdminClient().auth.admin.generateLink({ type: "signup", email, password, options: { data: { full_name: name } } });
    if (error) {
      if (/already|registered/i.test(error.message)) return { error: "An account with this email already exists." };
      return { error: error.message };
    }

    const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const link = `${base}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=signup`;

    const mail = await sendMail({
      to: email,
      subject: "Confirm your account",
      text: `Confirm your account for the Project Accomplishment Tracker:\n\n${link}\n\nIf you didn't sign up, ignore this email.`,
      html: `<p>Confirm your account for the Project Accomplishment Tracker:</p>
<p><a href="${escapeHtml(link)}">Confirm my email</a></p>
<p style="color:#666;font-size:12px">If you didn't sign up, ignore this email.</p>`,
    });
    if (!mail.ok) return { error: "We couldn't send the confirmation email. Try again later." };
  } catch (e) {
    console.error("register failed", e);
    return { error: "We couldn't send the confirmation email. Try again later." };
  }
  return { success: "Check your inbox for a confirmation link to finish creating your account." };
}
