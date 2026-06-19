"use server";

// Server Actions de Ventas. Llaman al backend Express vía lib/api.js.
// Revalidan ventas y productos (el stock cambia con cada venta/anulación).
import { revalidatePath } from "next/cache";
import { apiPost, apiPatch } from "@/lib/api";

const RUTA_VENTAS = "/dashboard/ventas";
const RUTA_PRODUCTOS = "/dashboard/productos";

// payload = { clienteId, items: [{ productoId, cantidad }] }
// El usuarioId lo pone Express desde el token; no se envía.
export async function crearVenta(payload) {
  try {
    const res = await apiPost("/api/ventas", payload);
    revalidatePath(RUTA_VENTAS);
    revalidatePath(RUTA_PRODUCTOS);
    return { ok: true, venta: res?.data ?? null };
  } catch (e) {
    return { ok: false, error: e.message || "No se pudo registrar la venta." };
  }
}

export async function anularVenta(id) {
  try {
    await apiPatch(`/api/ventas/${id}/anular`);
    revalidatePath(RUTA_VENTAS);
    revalidatePath(RUTA_PRODUCTOS);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "No se pudo anular la venta." };
  }
}
