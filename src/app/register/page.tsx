"use client";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { register } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account…" : "Create account"}
    </Button>
  );
}

export default function RegisterPage() {
  const [state, action] = useFormState(register, {} as { error?: string; success?: string });
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form action={action} className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Project Accomplishment Tracker</p>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
        </div>
        {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
        {state.success && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{state.success}</p>}
        <Submit />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="underline">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
