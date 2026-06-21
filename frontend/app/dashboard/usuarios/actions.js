"use server";

// Server Action de Usuarios: cambiar el rol (solo ADMIN en el backend).
import { revalidatePath } from "next/cache";
import { apiPatch } from "@/lib/api";

const RUTA = "/dashboard/usuarios";

export async function cambiarRol(id, nuevoRol) {
  try {
    await apiPatch(`/api/usuarios/${id}/rol`, { rol: nuevoRol });
    revalidatePath(RUTA);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "No se pudo cambiar el rol." };
  }
}
