"use client";

import { useState, useTransition } from "react";
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "./actions";

export function CategoriasClient({ categorias, isAdmin, loadError }) {
  const [isPending, startTransition] = useTransition();

  // Diálogo de crear/editar. `editando` = null → crear; objeto → editar.
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nombre, setNombre] = useState("");

  // Diálogo de eliminar.
  const [aEliminar, setAEliminar] = useState(null);

  function abrirCrear() {
    setEditando(null);
    setNombre("");
    setFormOpen(true);
  }

  function abrirEditar(categoria) {
    setEditando(categoria);
    setNombre(categoria.nombre);
    setFormOpen(true);
  }

  function guardar() {
    const valor = nombre.trim();
    if (valor.length < 2) {
      toast.error("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    startTransition(async () => {
      const res = editando
        ? await actualizarCategoria(editando.id, valor)
        : await crearCategoria(valor);

      if (res.ok) {
        toast.success(
          editando ? "Categoría actualizada." : "Categoría creada."
        );
        setFormOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  function confirmarEliminar() {
    const id = aEliminar.id;
    startTransition(async () => {
      const res = await eliminarCategoria(id);
      if (res.ok) {
        toast.success("Categoría eliminada.");
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
          <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground">
            Gestiona las categorías de productos.
          </p>
        </div>
        {isAdmin ? (
          <Button onClick={abrirCrear} className="w-full sm:w-auto">
            <PlusIcon className="size-4" />
            Nueva categoría
          </Button>
        ) : null}
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
                  {isAdmin ? (
                    <TableHead className="w-32 text-right">Acciones</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 2 : 1}
                      className="text-center text-muted-foreground"
                    >
                      No hay categorías registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  categorias.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nombre}</TableCell>
                      {isAdmin ? (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => abrirEditar(c)}
                              aria-label={`Editar ${c.nombre}`}
                            >
                              <PencilIcon className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setAEliminar(c)}
                              aria-label={`Eliminar ${c.nombre}`}
                            >
                              <Trash2Icon className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Móvil (< md): tarjetas apiladas */}
          <div className="space-y-3 md:hidden">
            {categorias.length === 0 ? (
              <p className="rounded-lg border bg-background p-6 text-center text-sm text-muted-foreground">
                No hay categorías registradas.
              </p>
            ) : (
              categorias.map((c) => (
                <MobileCard key={c.id}>
                  <MobileCardHeader
                    className={isAdmin ? "items-center" : "items-center pb-4"}
                  >
                    <p className="min-w-0 break-words font-medium">
                      {c.nombre}
                    </p>
                  </MobileCardHeader>
                  {isAdmin ? (
                    <MobileCardActions>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirEditar(c)}
                      >
                        <PencilIcon className="size-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAEliminar(c)}
                      >
                        <Trash2Icon className="size-4 text-destructive" />
                        Eliminar
                      </Button>
                    </MobileCardActions>
                  ) : null}
                </MobileCard>
              ))
            )}
          </div>
        </>
      )}

      {/* Diálogo crear / editar */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
            <DialogDescription>
              {editando
                ? "Actualiza el nombre de la categoría."
                : "Crea una nueva categoría de productos."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") guardar();
              }}
              placeholder="Ej. Bebidas"
              disabled={isPending}
              autoFocus
            />
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

      {/* Diálogo de confirmación de borrado */}
      <Dialog
        open={aEliminar !== null}
        onOpenChange={(open) => !open && setAEliminar(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar{" "}
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
