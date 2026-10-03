import Image from "next/image";

/** Centered card shared by the sign-in and register pages. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/dpwh-logo.png" alt="DPWH logo" width={44} height={44} priority />
          <span className="text-lg font-semibold">Project Accomplishment Tracker</span>
        </div>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
