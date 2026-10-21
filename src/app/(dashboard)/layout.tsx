import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.isAdmin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-[260px] flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}