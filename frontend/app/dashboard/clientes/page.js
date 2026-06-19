import { auth } from "@/auth";
import { apiGet } from "@/lib/api";
import { ClientesClient } from "./clientes-client";

export default async function ClientesPage({ searchParams }) {
  const session = await auth();
  const isAdmin = session?.user?.rol === "ADMIN";

  // searchParams es asíncrono en esta versión de Next.
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;

  const query = new URLSearchParams();
  if (q) query.set("q", q);
  query.set("page", String(page));

  let clientes = [];
  let total = 0;
  let pageSize = 10;
  let loadError = null;

  try {
    const res = await apiGet(`/api/clientes?${query.toString()}`);
    clientes = res?.data ?? [];
    total = res?.total ?? 0;
    pageSize = res?.pageSize ?? 10;
  } catch (e) {
    loadError = e.message || "No se pudieron cargar los clientes.";
  }

  return (
    <ClientesClient
      clientes={clientes}
      total={total}
      page={page}
      pageSize={pageSize}
      q={q}
      isAdmin={isAdmin}
      loadError={loadError}
    />
  );
}
