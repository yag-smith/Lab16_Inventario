import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// Tarjeta de registro para móvil (< md). Sustituye a una fila de tabla:
// cabecera (título + estado/acento), filas etiqueta/valor y pie de acciones.
// Solo presentación: reutiliza los mismos datos y handlers de cada pantalla.

export function MobileCard({ children, className }) {
  // Reseteamos el gap/padding propio del Card para controlar el layout interno.
  return <Card className={cn("gap-0 py-0", className)}>{children}</Card>;
}

export function MobileCardHeader({ children, className }) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 p-4 pb-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export function MobileFields({ children, className }) {
  return (
    <dl className={cn("flex flex-col gap-2 px-4 pb-4", className)}>{children}</dl>
  );
}

export function MobileField({ label, children, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <dt className="shrink-0 text-xs font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-right text-sm">{children}</dd>
    </div>
  );
}

export function MobileCardActions({ children, className }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t bg-muted/30 px-3 py-2.5",
        className
      )}
    >
      {children}
    </div>
  );
}
