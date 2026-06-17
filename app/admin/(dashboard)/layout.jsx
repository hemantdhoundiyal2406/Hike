import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function DashboardLayout({ children, }) {
    const session = await getAdminSession();
    if (!session)
        redirect("/admin/login");
    return <AdminShell session={session}>{children}</AdminShell>;
}
