import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const email = user.email ?? "";
  const meta = user.user_metadata?.full_name;
  // No name on file (accounts made before the name field): derive one from the email, e.g. juan.delacruz -> Juan Delacruz
  const name =
    (typeof meta === "string" && meta.trim()) ||
    email.split("@")[0].split(/[._-]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") ||
    "User";

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar name={name} email={email} />
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
