import {
  CalendarDaysIcon,
  TrendingUpIcon,
  PackageIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { apiGet } from "@/lib/api";
import { formatPrecio } from "@/lib/format";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ventas de hoy
          </CardTitle>
          <CalendarDaysIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tabular-nums">
            {formatPrecio(data?.ventasHoy?.total ?? 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            {data?.ventasHoy?.cantidad ?? 0} venta
            {(data?.ventasHoy?.cantidad ?? 0) === 1 ? "" : "s"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ventas del mes
          </CardTitle>
          <TrendingUpIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tabular-nums">
            {formatPrecio(data?.ventasMes?.total ?? 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            {data?.ventasMes?.cantidad ?? 0} venta
            {(data?.ventasMes?.cantidad ?? 0) === 1 ? "" : "s"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Productos
          </CardTitle>
          <PackageIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tabular-nums">
            {data?.totalProductos ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">activos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Bajo stock
          </CardTitle>
          <TriangleAlertIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tabular-nums">
            {bajoStock.length}
          </div>
          {bajoStock.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Sin productos con bajo stock
            </p>
          ) : (
            <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
              {bajoStock.slice(0, 5).map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span className="truncate">{p.nombre}</span>
                  <span className="tabular-nums">{p.stock}</span>
                </li>
              ))}
              {bajoStock.length > 5 ? (
                <li className="text-muted-foreground/70">
                  y {bajoStock.length - 5} más…
                </li>
              ) : null}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
