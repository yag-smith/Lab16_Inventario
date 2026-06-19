import { auth } from "@/auth";
import { apiGet } from "@/lib/api";
import { VentasClient } from "./ventas-client";

export default async function VentasPage({ searchParams }) {
  const session = await auth();
  const isAdmin = session?.user?.rol === "ADMIN";

  // searchParams es asíncrono en esta versión de Next.
  const sp = await searchParams;
  const estado = sp.estado === "COMPLETADA" || sp.estado === "ANULADA" ? sp.estado : "";
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;

  const query = new URLSearchParams();
  if (estado) query.set("estado", estado);
  query.set("page", String(page));

  let ventas = [];
  let total = 0;
  let pageSize = 10;
  let loadError = null;

  try {
    // El backend ya filtra por rol (ADMIN todas, VENDEDOR solo las suyas).
    const res = await apiGet(`/api/ventas?${query.toString()}`);
    ventas = res?.data ?? [];
    total = res?.total ?? 0;
    pageSize = res?.pageSize ?? 10;
  } catch (e) {
    loadError = e.message || "No se pudieron cargar las ventas.";
  }

  return (
    <VentasClient
      ventas={ventas}
      total={total}
      page={page}
      pageSize={pageSize}
      estado={estado}
      isAdmin={isAdmin}
      loadError={loadError}
    />
  );
}
