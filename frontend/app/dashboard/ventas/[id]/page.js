import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatPrecio, formatFecha } from "@/lib/format";

const RUTA = "/dashboard/ventas";

export default async function VentaDetallePage({ params }) {
  // params es asíncrono en esta versión de Next.
  const { id } = await params;

  let venta = null;
  let loadError = null;
  try {
    const res = await apiGet(`/api/ventas/${id}`);
    venta = res?.data ?? null;
  } catch (e) {
    loadError = e.message || "No se pudo cargar la venta.";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild aria-label="Volver">
          <Link href={RUTA}>
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {venta ? `Venta #${venta.id}` : "Detalle de venta"}
        </h1>
      </div>

      {loadError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </p>
      ) : venta ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{venta.cliente?.nombre ?? "—"}</p>
                <p className="text-muted-foreground">
                  {venta.cliente?.tipoDoc} {venta.cliente?.numDoc}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Vendedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{venta.usuario?.nombre ?? "—"}</p>
                <p className="text-muted-foreground">{venta.usuario?.email}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  {formatFecha(venta.fecha)}
                </p>
                <p>
                  {venta.estado === "COMPLETADA" ? (
                    <Badge className="bg-green-600 text-white">COMPLETADA</Badge>
                  ) : (
                    <Badge variant="secondary">ANULADA</Badge>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cant.</TableHead>
                      <TableHead className="text-right">P. unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(venta.detalles ?? []).map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">
                          {d.producto?.nombre ?? `#${d.productoId}`}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {d.cantidad}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatPrecio(d.precioUnitario)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatPrecio(d.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between border-t pt-4 mt-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-semibold tabular-nums">
                  {formatPrecio(venta.total)}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
