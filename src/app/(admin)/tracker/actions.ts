"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { accomplishmentSchema, contractSchema } from "@/lib/validators";

type Result = { error?: string };

async function authed() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

function done(error?: { message: string } | null): Result {
  if (error) return { error: error.message };
  revalidatePath("/tracker");
  revalidatePath("/dashboard");
  return {};
}

export async function saveContract(id: string | null, values: Record<string, string>): Promise<Result> {
  const supabase = await authed();
  if (!supabase) return { error: "Your session has expired. Sign in again." };
  const parsed = contractSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const q = id
    ? supabase.from("contracts").update(parsed.data).eq("id", id)
    : supabase.from("contracts").insert(parsed.data);
  const { error } = await q;
  return done(error);
}

export async function deleteContract(id: string): Promise<Result> {
  const supabase = await authed();
  if (!supabase) return { error: "Your session has expired. Sign in again." };
  const { error } = await supabase.from("contracts").delete().eq("id", id);
  return done(error);
}

export async function saveAccomplishment(id: string | null, values: Record<string, string>): Promise<Result> {
  const supabase = await authed();
  if (!supabase) return { error: "Your session has expired. Sign in again." };
  const parsed = accomplishmentSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const q = id
    ? supabase.from("accomplishments").update(parsed.data).eq("id", id)
    : supabase.from("accomplishments").insert(parsed.data);
  const { error } = await q;
  return done(error);
}

export async function deleteAccomplishment(id: string): Promise<Result> {
  const supabase = await authed();
  if (!supabase) return { error: "Your session has expired. Sign in again." };
  const { error } = await supabase.from("accomplishments").delete().eq("id", id);
  return done(error);
}
