"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  EyeIcon,
  BanIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatPrecio, formatFecha } from "@/lib/format";
import { anularVenta } from "./actions";

const RUTA = "/dashboard/ventas";

function EstadoBadge({ estado }) {
  if (estado === "COMPLETADA") {
    return <Badge className="bg-green-600 text-white">COMPLETADA</Badge>;
  }
  return <Badge variant="secondary">ANULADA</Badge>;
}

export function VentasClient({
  ventas,
  total,
  page,
  pageSize,
  estado,
  isAdmin,
  loadError,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [aAnular, setAAnular] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function navegar(updates) {
    const next = { estado, page, ...updates };
    const params = new URLSearchParams();
    if (next.estado) params.set("estado", next.estado);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const qs = params.toString();
    router.push(qs ? `${RUTA}?${qs}` : RUTA);
  }

  function confirmarAnular() {
    const id = aAnular.id;
    startTransition(async () => {
      const res = await anularVenta(id);
      if (res.ok) {
        toast.success("Venta anulada. El stock fue repuesto.");
        setAAnular(null);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground">
            Historial de ventas registradas.
          </p>
        </div>
        {/* Registrar venta: ADMIN y VENDEDOR. */}
        <Button onClick={() => router.push(`${RUTA}/nueva`)}>
          <PlusIcon className="size-4" />
          Nueva venta
        </Button>
      </div>

      {/* Filtro por estado */}
      <div className="flex items-center gap-2">
        <Select
          value={estado || "all"}
          onValueChange={(val) =>
            navegar({ estado: val === "all" ? "" : val, page: 1 })
          }
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="COMPLETADA">Completadas</SelectItem>
            <SelectItem value="ANULADA">Anuladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loadError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <>
          <div className="rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-28 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No hay ventas registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  ventas.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium tabular-nums">
                        {v.id}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFecha(v.fecha)}
                      </TableCell>
                      <TableCell>{v.cliente?.nombre ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPrecio(v.total)}
                      </TableCell>
                      <TableCell>
                        <EstadoBadge estado={v.estado} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`${RUTA}/${v.id}`)}
                            aria-label={`Ver venta ${v.id}`}
                          >
                            <EyeIcon className="size-4" />
                          </Button>
                          {/* Anular: solo ADMIN y solo si está COMPLETADA. */}
                          {isAdmin && v.estado === "COMPLETADA" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setAAnular(v)}
                              aria-label={`Anular venta ${v.id}`}
                            >
                              <BanIcon className="size-4 text-destructive" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} venta{total === 1 ? "" : "s"} · Página {page} de{" "}
              {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegar({ page: page - 1 })}
                disabled={page <= 1}
              >
                <ChevronLeftIcon className="size-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegar({ page: page + 1 })}
                disabled={page >= totalPages}
              >
                Siguiente
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Diálogo de confirmación de anulación */}
      <Dialog
        open={aAnular !== null}
        onOpenChange={(open) => !open && setAAnular(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular venta</DialogTitle>
            <DialogDescription>
              Vas a anular la venta{" "}
              <span className="font-medium text-foreground">
                #{aAnular?.id}
              </span>
              . El stock de los productos vendidos se repondrá automáticamente.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAAnular(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarAnular}
              disabled={isPending}
            >
              {isPending ? "Anulando…" : "Anular venta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
