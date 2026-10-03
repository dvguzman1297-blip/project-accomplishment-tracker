"use client";
import { useFormState, useFormStatus } from "react-dom";
import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { resetPassword } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="h-11 w-full" disabled={pending}>
      {pending ? "Saving…" : "Set new password"}
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [state, action] = useFormState(resetPassword, {} as { error?: string });
  return (
    <AuthCard title="Set a new password" subtitle="Choose a password you haven't used before">
      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="h-11" />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required className="h-11" />
        </div>
        {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
        <Submit />
      </form>
    </AuthCard>
  );
}
