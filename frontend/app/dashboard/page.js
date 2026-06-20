import { auth } from "@/auth";
import { ResumenCards } from "@/components/dashboard/resumen-cards";

export default async function DashboardPage() {
  const session = await auth();
  const { nombre, rol } = session.user;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {nombre} 👋
        </h1>
        <p className="text-muted-foreground">
          Resumen del negocio · {rol}
        </p>
      </div>

      <ResumenCards />
    </div>
  );
}
