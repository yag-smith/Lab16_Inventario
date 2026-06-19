import { auth } from "@/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

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
          Bienvenido al sistema de gestión de ventas e inventario.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Tu sesión</CardTitle>
          <CardDescription>Datos del usuario autenticado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Nombre: </span>
            {nombre}
          </p>
          <p>
            <span className="text-muted-foreground">Rol: </span>
            <span className="font-medium">{rol}</span>
          </p>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Las tarjetas de métricas y los gráficos se agregarán en el módulo de
        reportes.
      </p>
    </div>
  );
}
