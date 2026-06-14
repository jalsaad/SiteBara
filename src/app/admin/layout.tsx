import type { Metadata } from "next";
import { ToastProvider } from "@/components/Toast";
import AdminTop from "./AdminTop";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

// L'accès est protégé en amont par le proxy (src/proxy.ts) : session requise,
// éditeur de pages et gestion des comptes réservés au rôle ADMIN.
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin">
      <ToastProvider>
        <AdminTop />
        {children}
      </ToastProvider>
    </div>
  );
}
