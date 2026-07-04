"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  MobileCard,
  MobileCardHeader,
  MobileFields,
  MobileField,
  MobileCardActions,
} from "@/components/dashboard/mobile-card";
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

import {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "./actions";

const STOCK_BAJO = 10;
const RUTA = "/dashboard/productos";
const FORM_VACIO = {
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  categoriaId: "none",
};

function formatPrecio(precio) {
  return `S/ ${Number(precio).toFixed(2)}`;
}

export function ProductosClient({
  productos,
  categorias,
  total,
  page,
  pageSize,
  q,
  categoria,
  isAdmin,
  loadError,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [busqueda, setBusqueda] = useState(q);
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [aEliminar, setAEliminar] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reescribe los query params de la URL para que el Server Component recargue.
  function navegar(updates) {
    const next = { q, categoria, page, ...updates };
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.categoria) params.set("categoria", next.categoria);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const qs = params.toString();
    router.push(qs ? `${RUTA}?${qs}` : RUTA);
  }

  function buscar() {
    navegar({ q: busqueda.trim(), page: 1 });
  }

  function setCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function abrirCrear() {
    setEditando(null);
    setForm(FORM_VACIO);
    setFormOpen(true);
  }

  function abrirEditar(p) {
    setEditando(p);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      precio: String(p.precio),
      stock: String(p.stock),
      categoriaId: p.categoriaId ? String(p.categoriaId) : "none",
    });
    setFormOpen(true);
  }

  function guardar() {
    const nombre = form.nombre.trim();
    if (nombre.length < 2) {
      toast.error("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    const precio = Number(form.precio);
    if (form.precio === "" || Number.isNaN(precio) || precio < 0) {
      toast.error("El precio debe ser un número mayor o igual a 0.");
      return;
    }
    const stock = parseInt(form.stock, 10);
    if (form.stock === "" || Number.isNaN(stock) || stock < 0) {
      toast.error("El stock debe ser un entero mayor o igual a 0.");
      return;
    }

    const payload = {
      nombre,
      descripcion: form.descripcion.trim() || null,
      precio,
      stock,
      categoriaId: form.categoriaId === "none" ? null : Number(form.categoriaId),
    };

    startTransition(async () => {
      const res = editando
        ? await actualizarProducto(editando.id, payload)
        : await crearProducto(payload);

      if (res.ok) {
        toast.success(editando ? "Producto actualizado." : "Producto creado.");
        setFormOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  function confirmarEliminar() {
    const id = aEliminar.id;
    startTransition(async () => {
      const res = await eliminarProducto(id);
      if (res.ok) {
        toast.success("Producto desactivado.");
        setAEliminar(null);
      } else {
        toast.error(res.error);
      }
    });
  }

  const colSpan = isAdmin ? 5 : 4;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Gestiona el catálogo y el stock.
          </p>
        </div>
        {isAdmin ? (
          <Button onClick={abrirCrear} className="w-full sm:w-auto">
            <PlusIcon className="size-4" />
            Nuevo producto
          </Button>
        ) : null}
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Input
            placeholder="Buscar por nombre…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") buscar();
            }}
            className="flex-1 sm:w-64 sm:flex-none"
          />
          <Button variant="outline" onClick={buscar} className="shrink-0">
            <SearchIcon className="size-4" />
            <span className="hidden sm:inline">Buscar</span>
          </Button>
        </div>

        <Select
          value={categoria || "all"}
          onValueChange={(val) =>
            navegar({ categoria: val === "all" ? "" : val, page: 1 })
          }
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loadError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <>
          {/* Escritorio (md+): tabla tradicional */}
          <div className="hidden overflow-hidden rounded-lg border bg-background md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  {isAdmin ? (
                    <TableHead className="w-32 text-right">Acciones</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={colSpan}
                      className="text-center text-muted-foreground"
                    >
                      No se encontraron productos.
                    </TableCell>
                  </TableRow>
                ) : (
                  productos.map((p) => {
                    const bajo = p.stock <= STOCK_BAJO;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.nombre}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.categoria?.nombre ?? "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatPrecio(p.precio)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-2 tabular-nums">
                            {p.stock}
                            {bajo ? (
                              <Badge variant="destructive">Bajo</Badge>
                            ) : null}
                          </span>
                        </TableCell>
                        {isAdmin ? (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => abrirEditar(p)}
                                aria-label={`Editar ${p.nombre}`}
                              >
                                <PencilIcon className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setAEliminar(p)}
                                aria-label={`Desactivar ${p.nombre}`}
                              >
                                <Trash2Icon className="size-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Móvil (< md): tarjetas apiladas */}
          <div className="space-y-3 md:hidden">
            {productos.length === 0 ? (
              <p className="rounded-lg border bg-background p-6 text-center text-sm text-muted-foreground">
                No se encontraron productos.
              </p>
            ) : (
              productos.map((p) => {
                const bajo = p.stock <= STOCK_BAJO;
                return (
                  <MobileCard key={p.id}>
                    <MobileCardHeader>
                      <div className="min-w-0">
                        <p className="break-words font-medium">{p.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.categoria?.nombre ?? "Sin categoría"}
                        </p>
                      </div>
                      <span className="shrink-0 font-medium tabular-nums">
                        {formatPrecio(p.precio)}
                      </span>
                    </MobileCardHeader>
                    <MobileFields>
                      <MobileField label="Stock">
                        <span className="inline-flex items-center gap-2 tabular-nums">
                          {p.stock}
                          {bajo ? (
                            <Badge variant="destructive">Bajo</Badge>
                          ) : null}
                        </span>
                      </MobileField>
                    </MobileFields>
                    {isAdmin ? (
                      <MobileCardActions>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirEditar(p)}
                        >
                          <PencilIcon className="size-4" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAEliminar(p)}
                        >
                          <Trash2Icon className="size-4 text-destructive" />
                          Desactivar
                        </Button>
                      </MobileCardActions>
                    ) : null}
                  </MobileCard>
                );
              })
            )}
          </div>

          {/* Paginación */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {total} resultado{total === 1 ? "" : "s"} · Página {page} de{" "}
              {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => navegar({ page: page - 1 })}
                disabled={page <= 1}
              >
                <ChevronLeftIcon className="size-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
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

      {/* Diálogo crear / editar */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
            <DialogDescription>
              {editando
                ? "Actualiza los datos del producto."
                : "Registra un nuevo producto en el catálogo."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => setCampo("nombre", e.target.value)}
                placeholder="Ej. Coca-Cola 500ml"
                disabled={isPending}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={form.descripcion}
                onChange={(e) => setCampo("descripcion", e.target.value)}
                placeholder="Opcional"
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio">Precio (S/)</Label>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.precio}
                  onChange={(e) => setCampo("precio", e.target.value)}
                  placeholder="0.00"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => setCampo("stock", e.target.value)}
                  placeholder="0"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={form.categoriaId}
                onValueChange={(val) => setCampo("categoriaId", val)}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button onClick={guardar} disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de baja lógica */}
      <Dialog
        open={aEliminar !== null}
        onOpenChange={(open) => !open && setAEliminar(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar producto</DialogTitle>
            <DialogDescription>
              El producto{" "}
              <span className="font-medium text-foreground">
                {aEliminar?.nombre}
              </span>{" "}
              se marcará como inactivo (baja lógica) y dejará de aparecer en el
              listado. No se elimina de la base de datos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAEliminar(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarEliminar}
              disabled={isPending}
            >
              {isPending ? "Desactivando…" : "Desactivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
