"use client";

import { LogOutIcon } from "lucide-react";

import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Button } from "@/components/ui/button";

// Contenido interno de la barra lateral: cabecera con marca, navegación y bloque
// del usuario. Se reutiliza tal cual en la sidebar fija (escritorio) y dentro del
// panel deslizante (móvil/tablet). `onNavigate` permite cerrar el panel al navegar.
export function SidebarBody({ navItems, user, signOutAction, onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <span className="text-base font-semibold tracking-tight">
          <span className="text-sidebar-accent-strong">Ventas</span> e Inventario
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <SidebarNav items={navItems} onNavigate={onNavigate} />
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3">
          <p className="truncate text-sm font-medium">{user.nombre}</p>
          <p className="text-xs text-sidebar-foreground/60">{user.rol}</p>
        </div>
        <form action={signOutAction}>
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
    </div>
  );
}
