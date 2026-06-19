"use server";

// Server Actions de Productos. Llaman al backend Express vía lib/api.js
// y revalidan la ruta para refrescar la tabla.
import { revalidatePath } from "next/cache";
import { apiPost, apiPut, apiDelete } from "@/lib/api";

const RUTA = "/dashboard/productos";

export async function crearProducto(data) {
  try {
    await apiPost("/api/productos", data);
    revalidatePath(RUTA);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "No se pudo crear el producto." };
  }
}

export async function actualizarProducto(id, data) {
  try {
    await apiPut(`/api/productos/${id}`, data);
    revalidatePath(RUTA);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "No se pudo actualizar el producto." };
  }
}

export async function eliminarProducto(id) {
  try {
    // El backend hace baja lógica (activo = false).
    await apiDelete(`/api/productos/${id}`);
    revalidatePath(RUTA);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "No se pudo desactivar el producto." };
  }
}
