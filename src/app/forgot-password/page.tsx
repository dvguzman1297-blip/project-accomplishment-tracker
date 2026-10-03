"use client";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { requestReset } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="h-11 w-full" disabled={pending}>
      {pending ? "Sending…" : "Send reset link"}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, action] = useFormState(requestReset, {} as { error?: string; success?: string });
  return (
    <AuthCard title="Forgot password" subtitle="Enter your email and we'll send you a reset link">
      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
        </div>
        {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
        {state.success && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{state.success}</p>}
        <Submit />
        <p className="pt-2 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">Back to sign in</Link>
        </p>
      </form>
    </AuthCard>
  );
}
