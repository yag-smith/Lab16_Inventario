"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  PackageIcon,
  TagsIcon,
  UsersIcon,
  ShoppingCartIcon,
  BarChart3Icon,
  UserCogIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ICONS = {
  dashboard: LayoutDashboardIcon,
  productos: PackageIcon,
  categorias: TagsIcon,
  clientes: UsersIcon,
  ventas: ShoppingCartIcon,
  reportes: BarChart3Icon,
  usuarios: UserCogIcon,
};

export function SidebarNav({ items, onNavigate }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.key];
        // Activo si coincide exacto o si es una subruta (salvo el dashboard raíz).
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
              active
                ? "bg-sidebar-active text-sidebar-accent-strong ring-1 ring-sidebar-accent-strong/20"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            {/* Barra de acento a la izquierda del enlace activo. */}
            <span
              className={cn(
                "absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-sidebar-accent-strong transition-opacity duration-200",
                active ? "opacity-100" : "opacity-0"
              )}
              aria-hidden
            />
            {Icon ? (
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors duration-200",
                  active
                    ? "text-sidebar-accent-strong"
                    : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                )}
              />
            ) : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
