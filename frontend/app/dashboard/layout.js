import { redirect } from "next/navigation";
import { LogOutIcon } from "lucide-react";

import { auth, signOut } from "@/auth";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-base font-semibold">Ventas e Inventario</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <SidebarNav items={navItems} />
        </div>

        <div className="border-t p-4">
          <div className="mb-3">
            <p className="truncate text-sm font-medium">
              {session.user.nombre}
            </p>
            <p className="text-xs text-sidebar-foreground/60">
              {session.user.rol}
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <LogOutIcon className="size-4" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-muted/20 p-8">{children}</main>
    </div>
  );
}
