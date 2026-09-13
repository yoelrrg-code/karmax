import { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth/adminGuard";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const metadata: Metadata = {
  title: "Administración | KARMAX",
  description: "Panel de control y gestión institucional de KARMAX",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminSession();

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
