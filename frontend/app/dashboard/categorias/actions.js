"use server";

// Server Actions de Categorías. Llaman al backend Express vía lib/api.js
// (que adjunta el Bearer token) y revalidan la ruta para refrescar la tabla.
import { revalidatePath } from "next/cache";
import { apiPost, apiPut, apiDelete } from "@/lib/api";

const RUTA = "/dashboard/categorias";

export async function crearCategoria(nombre) {
  try {
    await apiPost("/api/categorias", { nombre });
    revalidatePath(RUTA);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "No se pudo crear la categoría." };
  }
}

export async function actualizarCategoria(id, nombre) {
  try {
    await apiPut(`/api/categorias/${id}`, { nombre });
    revalidatePath(RUTA);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "No se pudo actualizar la categoría." };
  }
}

export async function eliminarCategoria(id) {
  try {
    await apiDelete(`/api/categorias/${id}`);
    revalidatePath(RUTA);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "No se pudo eliminar la categoría." };
  }
}
