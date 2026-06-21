"use client";

import { useTransition } from "react";
import { toast } from "sonner";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cambiarRol } from "./actions";

function RolBadge({ rol }) {
  if (rol === "ADMIN") {
    return <Badge className="bg-primary text-primary-foreground">ADMIN</Badge>;
  }
  return <Badge variant="secondary">VENDEDOR</Badge>;
}

export function UsuariosClient({ usuarios, currentUserId, loadError }) {
  const [isPending, startTransition] = useTransition();

  function onCambiarRol(usuario, nuevoRol) {
    if (nuevoRol === usuario.rol) return;

    // Salvaguarda: el admin logueado no puede auto-degradarse.
    if (
      String(usuario.id) === String(currentUserId) &&
      nuevoRol === "VENDEDOR"
    ) {
      toast.warning("No puedes quitarte a ti mismo el rol de administrador.");
      return;
    }

    startTransition(async () => {
      const res = await cambiarRol(usuario.id, nuevoRol);
      if (res.ok) {
        toast.success(`Rol de ${usuario.nombre} actualizado a ${nuevoRol}.`);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-muted-foreground">
          Gestiona los roles de los usuarios del sistema.
        </p>
      </div>

      {loadError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead className="w-48 text-right">Cambiar rol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No hay usuarios registrados.
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((u) => {
                  const esYo = String(u.id) === String(currentUserId);
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.nombre}
                        {esYo ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (tú)
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <RolBadge rol={u.rol} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.proveedor}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Select
                            value={u.rol}
                            onValueChange={(val) => onCambiarRol(u, val)}
                            disabled={isPending}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">ADMIN</SelectItem>
                              <SelectItem value="VENDEDOR">VENDEDOR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
