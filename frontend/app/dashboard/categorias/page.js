import { auth } from "@/auth";
import { apiGet } from "@/lib/api";
import { CategoriasClient } from "./categorias-client";

export default async function CategoriasPage() {
  const session = await auth();
  const isAdmin = session?.user?.rol === "ADMIN";

  let categorias = [];
  let loadError = null;
  try {
    const res = await apiGet("/api/categorias");
    categorias = res?.data ?? [];
  } catch (e) {
    loadError = e.message || "No se pudieron cargar las categorías.";
  }

  return (
    <CategoriasClient
      categorias={categorias}
      isAdmin={isAdmin}
      loadError={loadError}
    />
  );
}
