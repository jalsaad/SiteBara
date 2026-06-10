import type { Metadata } from "next";
import { ToastProvider } from "@/components/Toast";
import AdminTop from "./AdminTop";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

// NOTE : l'authentification (accès réservé aux administrateurs et aux
// responsables communication, cf. cahier des charges) sera branchée ici.
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
