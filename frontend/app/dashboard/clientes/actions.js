"use server";

// Server Actions de Clientes. Llaman al backend Express vía lib/api.js
// y revalidan la ruta para refrescar la tabla.
import { revalidatePath } from "next/cache";
import { apiPost, apiPut, apiDelete } from "@/lib/api";

const RUTA = "/dashboard/clientes";

export async function crearCliente(data) {
  try {
    await apiPost("/api/clientes", data);
    revalidatePath(RUTA);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "No se pudo crear el cliente." };
  }
}

export async function actualizarCliente(id, data) {
  try {
    await apiPut(`/api/clientes/${id}`, data);
    revalidatePath(RUTA);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "No se pudo actualizar el cliente." };
  }
}

export async function eliminarCliente(id) {
  try {
    await apiDelete(`/api/clientes/${id}`);
    revalidatePath(RUTA);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "No se pudo eliminar el cliente." };
  }
}
