"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";

import { SidebarBody } from "@/components/dashboard/sidebar-body";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Carcasa responsiva del dashboard.
// - lg y superior: sidebar fija a la izquierda.
// - por debajo de lg: sidebar oculta; header con menú hamburguesa que abre un
//   panel lateral (Sheet). El panel se cierra solo al cambiar de ruta.
export function DashboardShell({ navItems, user, signOutAction, children }) {
  // El panel móvil se cierra al pulsar un enlace (ver `onNavigate`) o el botón X.
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-1">
      {/* Sidebar fija — solo escritorio */}
      <aside className="sidebar-surface hidden w-64 shrink-0 flex-col border-r border-sidebar-border text-sidebar-foreground lg:flex">
        <SidebarBody
          navItems={navItems}
          user={user}
          signOutAction={signOutAction}
        />
      </aside>

      {/* Columna de contenido */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header — solo móvil/tablet */}
        <header className="sidebar-surface flex h-14 items-center gap-3 border-b border-sidebar-border px-4 text-sidebar-foreground lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Abrir menú de navegación"
              >
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="sidebar-surface w-72 gap-0 border-sidebar-border p-0 text-sidebar-foreground"
            >
              {/* Título y descripción accesibles para el diálogo del panel. */}
              <SheetTitle className="sr-only">Navegación</SheetTitle>
              <SheetDescription className="sr-only">
                Menú principal del panel de ventas e inventario
              </SheetDescription>
              <SidebarBody
                navItems={navItems}
                user={user}
                signOutAction={signOutAction}
                onNavigate={() => setOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <span className="text-base font-semibold tracking-tight">
            <span className="text-sidebar-accent-strong">Ventas</span> e Inventario
          </span>
        </header>

        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
