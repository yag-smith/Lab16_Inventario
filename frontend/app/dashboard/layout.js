import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

// Enlaces base de la barra lateral. "usuarios" se agrega solo para ADMIN.
const NAV_BASE = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard" },
  { key: "productos", href: "/dashboard/productos", label: "Productos" },
  { key: "categorias", href: "/dashboard/categorias", label: "Categorías" },
  { key: "clientes", href: "/dashboard/clientes", label: "Clientes" },
  { key: "ventas", href: "/dashboard/ventas", label: "Ventas" },
  { key: "reportes", href: "/dashboard/reportes", label: "Reportes" },
];

const NAV_ADMIN = {
  key: "usuarios",
  href: "/dashboard/usuarios",
  label: "Usuarios",
};

export default async function DashboardLayout({ children }) {
  const session = await auth();

  // Defensa extra además del middleware (por si la sesión no resolvió).
  if (!session?.user) {
    redirect("/login");
  }

  const esAdmin = session.user.rol === "ADMIN";
  const navItems = esAdmin ? [...NAV_BASE, NAV_ADMIN] : NAV_BASE;

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <DashboardShell
      navItems={navItems}
      user={{ nombre: session.user.nombre, rol: session.user.rol }}
      signOutAction={signOutAction}
    >
      {children}
    </DashboardShell>
  );
}
