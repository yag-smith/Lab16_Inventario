import { apiGet } from "@/lib/api";
import { ResumenCards } from "@/components/dashboard/resumen-cards";
import { ReportesCharts } from "./reportes-charts";

export default async function ReportesPage() {
  let ventasPorDia = [];
  let topProductos = [];
  let loadError = null;

  try {
    const [resDia, resTop] = await Promise.all([
      apiGet("/api/reportes/ventas-por-dia"),
      apiGet("/api/reportes/top-productos"),
    ]);
    ventasPorDia = resDia?.data ?? [];
    topProductos = resTop?.data ?? [];
  } catch (e) {
    loadError = e.message || "No se pudieron cargar los gráficos.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">
          Resumen y gráficos del negocio.
        </p>
      </div>

      <ResumenCards />

      {loadError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <ReportesCharts
          ventasPorDia={ventasPorDia}
          topProductos={topProductos}
        />
      )}
    </div>
  );
}
