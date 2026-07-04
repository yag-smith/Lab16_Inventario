import {
  CalendarDaysIcon,
  TrendingUpIcon,
  PackageIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { apiGet } from "@/lib/api";
import { formatPrecio } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Tarjeta de métrica: icono en círculo de acento, valor grande y etiqueta corta.
// Con elevación y borde de acento sutiles en hover.
function MetricCard({ Icon, label, value, hint, iconClass, ringClass }) {
  return (
    <Card
      className={cn(
        "gap-0 py-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-2",
        ringClass
      )}
    >
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            iconClass
          )}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

// Server Component reutilizable. Obtiene su propio resumen y se usa tanto en el
// dashboard principal como en la página de reportes.
export async function ResumenCards() {
  let data = null;
  let error = null;
  try {
    const res = await apiGet("/api/reportes/resumen");
    data = res?.data ?? null;
  } catch (e) {
    error = e.message || "No se pudo cargar el resumen.";
  }

  if (error) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </p>
    );
  }

  const bajoStock = data?.productosBajoStock ?? [];
  const hayBajos = bajoStock.length > 0;

  const ventasHoyCant = data?.ventasHoy?.cantidad ?? 0;
  const ventasMesCant = data?.ventasMes?.cantidad ?? 0;

  const metricas = [
    {
      key: "hoy",
      Icon: CalendarDaysIcon,
      label: "Ventas de hoy",
      value: formatPrecio(data?.ventasHoy?.total ?? 0),
      hint: `${ventasHoyCant} venta${ventasHoyCant === 1 ? "" : "s"}`,
      iconClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      ringClass: "hover:ring-indigo-500/40",
    },
    {
      key: "mes",
      Icon: TrendingUpIcon,
      label: "Ventas del mes",
      value: formatPrecio(data?.ventasMes?.total ?? 0),
      hint: `${ventasMesCant} venta${ventasMesCant === 1 ? "" : "s"}`,
      iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      ringClass: "hover:ring-emerald-500/40",
    },
    {
      key: "productos",
      Icon: PackageIcon,
      label: "Productos",
      value: data?.totalProductos ?? 0,
      hint: "activos",
      iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      ringClass: "hover:ring-sky-500/40",
    },
    {
      key: "bajo",
      Icon: TriangleAlertIcon,
      label: "Bajo stock",
      value: bajoStock.length,
      hint: hayBajos ? "requieren reposición" : "todo en orden",
      iconClass: hayBajos
        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      ringClass: hayBajos
        ? "hover:ring-amber-500/40"
        : "hover:ring-emerald-500/40",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricas.map((m) => (
          <MetricCard
            key={m.key}
            Icon={m.Icon}
            label={m.label}
            value={m.value}
            hint={m.hint}
            iconClass={m.iconClass}
            ringClass={m.ringClass}
          />
        ))}
      </div>

      {/* Mini-lista de productos con bajo stock, legible debajo de las tarjetas. */}
      {hayBajos ? (
        <Card className="gap-0 py-0">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <TriangleAlertIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">Productos con bajo stock</p>
                <p className="text-xs text-muted-foreground">
                  {bajoStock.length} producto
                  {bajoStock.length === 1 ? "" : "s"} requiere
                  {bajoStock.length === 1 ? "" : "n"} reposición
                </p>
              </div>
            </div>
            <ul className="divide-y">
              {bajoStock.slice(0, 6).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate">{p.nombre}</span>
                  <Badge variant="destructive" className="shrink-0 tabular-nums">
                    {p.stock}
                  </Badge>
                </li>
              ))}
            </ul>
            {bajoStock.length > 6 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                y {bajoStock.length - 6} más…
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
