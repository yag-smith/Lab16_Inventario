import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { apiGet } from "@/lib/api";
import { UsuariosClient } from "./usuarios-client";

export default async function UsuariosPage() {
  const session = await auth();

  // Defensa en el frontend (el backend igual responde 403 a no-ADMIN).
  if (session?.user?.rol !== "ADMIN") {
    redirect("/dashboard");
  }

  let usuarios = [];
  let loadError = null;
  try {
    const res = await apiGet("/api/usuarios");
    usuarios = res?.data ?? [];
  } catch (e) {
    loadError = e.message || "No se pudieron cargar los usuarios.";
  }

  return (
    <UsuariosClient
      usuarios={usuarios}
      currentUserId={session.user.id}
      loadError={loadError}
    />
  );
}
