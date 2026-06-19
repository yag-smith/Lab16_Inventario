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

export function SidebarNav({ items }) {
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
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            {Icon ? <Icon className="size-4" /> : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
