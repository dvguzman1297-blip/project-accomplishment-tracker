"use client";
import { useFormState, useFormStatus } from "react-dom";
import { HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { signIn } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, action] = useFormState(signIn, {} as { error?: string });
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_28rem]">
      <section className="hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-end">
        <HardHat className="mb-6 h-10 w-10 text-accent" />
        <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
          Every contract, from bid-out to expiry, in one register.
        </h1>
        <p className="mt-4 max-w-md text-sm opacity-80">Log accomplishments, watch progress, and catch contracts running past their expiry date.</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <form action={action} className="w-full max-w-sm space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Admin sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">Project Accomplishment Tracker</p>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
          <Submit />
        </form>
      </section>
    </main>
  );
}
