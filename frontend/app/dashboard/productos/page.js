import { auth } from "@/auth";
import { apiGet } from "@/lib/api";
import { ProductosClient } from "./productos-client";

export default async function ProductosPage({ searchParams }) {
  const session = await auth();
  const isAdmin = session?.user?.rol === "ADMIN";

  // En esta versión de Next, searchParams es asíncrono.
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const categoria = typeof sp.categoria === "string" ? sp.categoria : "";
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;

  // Arma el query para el backend.
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (categoria) query.set("categoria", categoria);
  query.set("page", String(page));

  let productos = [];
  let total = 0;
  let pageSize = 10;
  let categorias = [];
  let loadError = null;

  try {
    const [resProd, resCat] = await Promise.all([
      apiGet(`/api/productos?${query.toString()}`),
      apiGet("/api/categorias"),
    ]);
    productos = resProd?.data ?? [];
    total = resProd?.total ?? 0;
    pageSize = resProd?.pageSize ?? 10;
    categorias = resCat?.data ?? [];
  } catch (e) {
    loadError = e.message || "No se pudieron cargar los productos.";
  }

  return (
    <ProductosClient
      productos={productos}
      categorias={categorias}
      total={total}
      page={page}
      pageSize={pageSize}
      q={q}
      categoria={categoria}
      isAdmin={isAdmin}
      loadError={loadError}
    />
  );
}
