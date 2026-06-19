"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatPrecio } from "@/lib/format";
import { crearVenta } from "../actions";

const RUTA = "/dashboard/ventas";

export function NuevaVentaClient({ clientes, productos, loadError }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [clienteId, setClienteId] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [carrito, setCarrito] = useState([]);

  const total = carrito.reduce(
    (acc, l) => acc + l.precioUnitario * l.cantidad,
    0
  );

  function agregar() {
    const prod = productos.find((p) => String(p.id) === productoId);
    if (!prod) {
      toast.error("Selecciona un producto.");
      return;
    }
    const cant = parseInt(cantidad, 10);
    if (Number.isNaN(cant) || cant <= 0) {
      toast.error("La cantidad debe ser un entero mayor que 0.");
      return;
    }

    const enCarrito = carrito.find((l) => l.productoId === prod.id);
    const yaAgregado = enCarrito ? enCarrito.cantidad : 0;
    const disponible = prod.stock - yaAgregado;

    if (cant > disponible) {
      toast.error(
        disponible > 0
          ? `Stock insuficiente para ${prod.nombre}. Disponible: ${disponible}.`
          : `Sin stock disponible para ${prod.nombre}.`
      );
      return;
    }

    if (enCarrito) {
      setCarrito((c) =>
        c.map((l) =>
          l.productoId === prod.id
            ? { ...l, cantidad: l.cantidad + cant }
            : l
        )
      );
    } else {
      setCarrito((c) => [
        ...c,
        {
          productoId: prod.id,
          nombre: prod.nombre,
          precioUnitario: Number(prod.precio),
          cantidad: cant,
        },
      ]);
    }

    setCantidad("1");
  }

  function quitar(id) {
    setCarrito((c) => c.filter((l) => l.productoId !== id));
  }

  function registrar() {
    if (!clienteId) {
      toast.error("Selecciona un cliente.");
      return;
    }
    if (carrito.length === 0) {
      toast.error("Agrega al menos un producto.");
      return;
    }

    const payload = {
      clienteId: Number(clienteId),
      items: carrito.map((l) => ({
        productoId: l.productoId,
        cantidad: l.cantidad,
      })),
    };

    startTransition(async () => {
      const res = await crearVenta(payload);
      if (res.ok) {
        toast.success("Venta registrada. El stock fue descontado.");
        setCarrito([]);
        router.push(RUTA);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(RUTA)}
          aria-label="Volver al listado"
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nueva venta</h1>
          <p className="text-muted-foreground">
            Selecciona un cliente y agrega productos al carrito.
          </p>
        </div>
      </div>

      {loadError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Columna izquierda: cliente + agregar producto */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nombre} ({c.tipoDoc} {c.numDoc})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clientes.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No hay clientes registrados.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agregar producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Producto</Label>
                  <Select value={productoId} onValueChange={setProductoId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={String(p.id)}
                          disabled={p.stock <= 0}
                        >
                          {p.nombre} — {formatPrecio(p.precio)} (stock {p.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad</Label>
                    <Input
                      id="cantidad"
                      type="number"
                      min="1"
                      step="1"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      className="w-28"
                    />
                  </div>
                  <Button onClick={agregar} className="flex-1">
                    <PlusIcon className="size-4" />
                    Agregar al carrito
                  </Button>
                </div>
                {productos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay productos disponibles.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha: carrito */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Carrito</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cant.</TableHead>
                        <TableHead className="text-right">P. unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carrito.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-muted-foreground"
                          >
                            El carrito está vacío.
                          </TableCell>
                        </TableRow>
                      ) : (
                        carrito.map((l) => (
                          <TableRow key={l.productoId}>
                            <TableCell className="font-medium">
                              {l.nombre}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {l.cantidad}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatPrecio(l.precioUnitario)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatPrecio(l.precioUnitario * l.cantidad)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => quitar(l.productoId)}
                                aria-label={`Quitar ${l.nombre}`}
                              >
                                <Trash2Icon className="size-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-semibold tabular-nums">
                    {formatPrecio(total)}
                  </span>
                </div>

                <Button
                  className="w-full"
                  onClick={registrar}
                  disabled={isPending || carrito.length === 0 || !clienteId}
                >
                  {isPending ? "Registrando…" : "Registrar venta"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
