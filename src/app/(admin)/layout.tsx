import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { todayManila } from "@/lib/format";
import { buildNotices } from "@/lib/notifications";
import type { Contract } from "@/lib/types";

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

  // Badge count for the Notifications link
  const { data: contracts } = await supabase.from("contracts").select("*");
  const notices = buildNotices((contracts ?? []) as Contract[], todayManila());

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar name={name} email={email} notices={notices.length} />
      <main className="relative min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <div className="absolute right-4 top-3 z-40 lg:right-8 lg:top-5">
          <NotificationBell notices={notices} />
        </div>
        {children}
      </main>
    </div>
  );
}
