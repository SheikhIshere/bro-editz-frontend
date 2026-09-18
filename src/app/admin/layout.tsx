import type { ReactNode } from "react";
import { AdminAuthGate, AdminAuthProvider } from "./providers/AdminAuthProvider";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <AdminAuthProvider>
      <AdminAuthGate>{children}</AdminAuthGate>
    </AdminAuthProvider>
  );
}
