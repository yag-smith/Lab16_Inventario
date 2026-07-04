import { auth } from "@/auth";
import { ResumenCards } from "@/components/dashboard/resumen-cards";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();
  const { nombre, rol } = session.user;

  // Fecha del día (se resuelve por request en el servidor).
  const fecha = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Hola, <span className="text-sidebar-accent-strong">{nombre}</span>{" "}
          <span aria-hidden>👋</span>
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="first-letter:uppercase">{fecha}</span>
          <span aria-hidden className="text-muted-foreground/40">
            ·
          </span>
          <Badge variant="outline">{rol}</Badge>
        </div>
      </div>

      <ResumenCards />
    </div>
  );
}
