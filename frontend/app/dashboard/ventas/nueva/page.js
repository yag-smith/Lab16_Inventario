import { apiGet } from "@/lib/api";
import { NuevaVentaClient } from "./nueva-venta-client";

export default async function NuevaVentaPage() {
  let clientes = [];
  let productos = [];
  let loadError = null;

  try {
    const [resCli, resProd] = await Promise.all([
      apiGet("/api/clientes?pageSize=100"),
      apiGet("/api/productos?pageSize=100"),
    ]);
    clientes = resCli?.data ?? [];
    productos = resProd?.data ?? [];
  } catch (e) {
    loadError = e.message || "No se pudieron cargar los datos para la venta.";
  }

  return (
    <NuevaVentaClient
      clientes={clientes}
      productos={productos}
      loadError={loadError}
    />
  );
}
