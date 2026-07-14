import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "./sidebar";
import { NotificationBell } from "./notification-bell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <DashboardSidebar
        rol={(session.user as any).rol}
        userName={session.user.name ?? ""}
      />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-end px-6 py-3 border-b border-zinc-800 bg-zinc-900/50">
          <NotificationBell />
        </header>
        <main className="flex-1 p-6 overflow-auto text-white">{children}</main>
      </div>
    </div>
  );
}
