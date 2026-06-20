"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { formatPrecio } from "@/lib/format";

function SinDatos() {
  return (
    <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
      Sin datos en el periodo
    </div>
  );
}

export function ReportesCharts({ ventasPorDia, topProductos }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Ventas por día</CardTitle>
          <CardDescription>Total vendido por jornada.</CardDescription>
        </CardHeader>
        <CardContent>
          {ventasPorDia.length === 0 ? (
            <SinDatos />
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ventasPorDia}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="fecha" fontSize={12} tickMargin={8} />
                  <YAxis fontSize={12} width={48} />
                  <Tooltip
                    formatter={(value) => [formatPrecio(value), "Total"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top productos</CardTitle>
          <CardDescription>Más vendidos por cantidad.</CardDescription>
        </CardHeader>
        <CardContent>
          {topProductos.length === 0 ? (
            <SinDatos />
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductos}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="nombre" fontSize={12} tickMargin={8} />
                  <YAxis fontSize={12} width={48} allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [value, "Cantidad vendida"]}
                  />
                  <Bar
                    dataKey="cantidadVendida"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
