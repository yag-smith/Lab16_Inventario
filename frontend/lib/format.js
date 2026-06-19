// Helpers de formato compartidos. Sin estado, seguros en cliente y servidor.

// Monto en soles a partir de un número o string Decimal del backend.
export function formatPrecio(valor) {
  return `S/ ${Number(valor).toFixed(2)}`;
}

// Fecha ISO a formato local corto (es-PE).
export function formatFecha(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
}
