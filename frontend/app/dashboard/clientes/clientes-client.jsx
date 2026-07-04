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

import { crearCliente, actualizarCliente, eliminarCliente } from "./actions";

const RUTA = "/dashboard/clientes";
const TIPOS_DOC = ["DNI", "RUC", "CE"];
const FORM_VACIO = {
  nombre: "",
  tipoDoc: "DNI",
  numDoc: "",
  email: "",
  telefono: "",
};

export function ClientesClient({
  clientes,
  total,
  page,
  pageSize,
  q,
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

  // Reescribe los query params para que el Server Component recargue.
  function navegar(updates) {
    const next = { q, page, ...updates };
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
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

  function abrirEditar(c) {
    setEditando(c);
    setForm({
      nombre: c.nombre,
      tipoDoc: c.tipoDoc ?? "DNI",
      numDoc: c.numDoc,
      email: c.email ?? "",
      telefono: c.telefono ?? "",
    });
    setFormOpen(true);
  }

  function guardar() {
    const nombre = form.nombre.trim();
    if (nombre.length < 2) {
      toast.error("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    const numDoc = form.numDoc.trim();
    if (numDoc.length === 0) {
      toast.error("El número de documento es obligatorio.");
      return;
    }

    const payload = {
      nombre,
      tipoDoc: form.tipoDoc,
      numDoc,
      email: form.email.trim() || null,
      telefono: form.telefono.trim() || null,
    };

    startTransition(async () => {
      const res = editando
        ? await actualizarCliente(editando.id, payload)
        : await crearCliente(payload);

      if (res.ok) {
        toast.success(editando ? "Cliente actualizado." : "Cliente creado.");
        setFormOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  function confirmarEliminar() {
    const id = aEliminar.id;
    startTransition(async () => {
      const res = await eliminarCliente(id);
      if (res.ok) {
        toast.success("Cliente eliminado.");
        setAEliminar(null);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Administra la cartera de clientes.
          </p>
        </div>
        {/* Crear lo pueden hacer ADMIN y VENDEDOR. */}
        <Button onClick={abrirCrear} className="w-full sm:w-auto">
          <PlusIcon className="size-4" />
          Nuevo cliente
        </Button>
      </div>

      {/* Búsqueda por nombre o número de documento */}
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <Input
          placeholder="Buscar por nombre o documento…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") buscar();
          }}
          className="flex-1 sm:w-72 sm:flex-none"
        />
        <Button variant="outline" onClick={buscar} className="shrink-0">
          <SearchIcon className="size-4" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>
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
                  <TableHead>Tipo doc.</TableHead>
                  <TableHead>N.º documento</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="w-32 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No se encontraron clientes.
                    </TableCell>
                  </TableRow>
                ) : (
                  clientes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nombre}</TableCell>
                      <TableCell>{c.tipoDoc}</TableCell>
                      <TableCell className="tabular-nums">{c.numDoc}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.email || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {c.telefono || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {/* Editar: ADMIN y VENDEDOR */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => abrirEditar(c)}
                            aria-label={`Editar ${c.nombre}`}
                          >
                            <PencilIcon className="size-4" />
                          </Button>
                          {/* Eliminar: solo ADMIN */}
                          {isAdmin ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setAEliminar(c)}
                              aria-label={`Eliminar ${c.nombre}`}
                            >
                              <Trash2Icon className="size-4 text-destructive" />
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

          {/* Móvil (< md): tarjetas apiladas */}
          <div className="space-y-3 md:hidden">
            {clientes.length === 0 ? (
              <p className="rounded-lg border bg-background p-6 text-center text-sm text-muted-foreground">
                No se encontraron clientes.
              </p>
            ) : (
              clientes.map((c) => (
                <MobileCard key={c.id}>
                  <MobileCardHeader>
                    <p className="min-w-0 break-words font-medium">{c.nombre}</p>
                    <Badge variant="outline" className="shrink-0">
                      {c.tipoDoc}
                    </Badge>
                  </MobileCardHeader>
                  <MobileFields>
                    <MobileField label="N.º documento">
                      <span className="tabular-nums">{c.numDoc}</span>
                    </MobileField>
                    <MobileField label="Email">{c.email || "—"}</MobileField>
                    <MobileField label="Teléfono">
                      <span className="tabular-nums">{c.telefono || "—"}</span>
                    </MobileField>
                  </MobileFields>
                  <MobileCardActions>
                    {/* Editar: ADMIN y VENDEDOR */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirEditar(c)}
                    >
                      <PencilIcon className="size-4" />
                      Editar
                    </Button>
                    {/* Eliminar: solo ADMIN */}
                    {isAdmin ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAEliminar(c)}
                      >
                        <Trash2Icon className="size-4 text-destructive" />
                        Eliminar
                      </Button>
                    ) : null}
                  </MobileCardActions>
                </MobileCard>
              ))
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
              {editando ? "Editar cliente" : "Nuevo cliente"}
            </DialogTitle>
            <DialogDescription>
              {editando
                ? "Actualiza los datos del cliente."
                : "Registra un nuevo cliente."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => setCampo("nombre", e.target.value)}
                placeholder="Ej. María López"
                disabled={isPending}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo doc.</Label>
                <Select
                  value={form.tipoDoc}
                  onValueChange={(val) => setCampo("tipoDoc", val)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_DOC.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="numDoc">N.º documento</Label>
                <Input
                  id="numDoc"
                  value={form.numDoc}
                  onChange={(e) => setCampo("numDoc", e.target.value)}
                  placeholder="Ej. 71234567"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setCampo("email", e.target.value)}
                placeholder="cliente@correo.com"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono (opcional)</Label>
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(e) => setCampo("telefono", e.target.value)}
                placeholder="987654321"
                disabled={isPending}
              />
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

      {/* Diálogo de confirmación de borrado (solo ADMIN llega aquí) */}
      <Dialog
        open={aEliminar !== null}
        onOpenChange={(open) => !open && setAEliminar(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar cliente</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar a{" "}
              <span className="font-medium text-foreground">
                {aEliminar?.nombre}
              </span>
              ? Esta acción no se puede deshacer.
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
              {isPending ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
