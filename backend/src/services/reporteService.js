// Lógica de negocio de reportes: arma rangos de fechas y compone las respuestas.
const reporteRepository = require("../repositories/reporteRepository");

// Inicio del día (00:00 hora local) de una fecha dada.
function inicioDia(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function sumarDias(fecha, dias) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d;
}

// Tarjetas del dashboard.
async function resumen({ umbral }) {
  const ahora = new Date();
  const inicioHoy = inicioDia(ahora);
  const finHoy = sumarDias(inicioHoy, 1);
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioMesSiguiente = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);

  const [ventasHoy, ventasMes, totalProductos, productosBajoStock] = await Promise.all([
    reporteRepository.aggregateVentas(inicioHoy, finHoy),
    reporteRepository.aggregateVentas(inicioMes, inicioMesSiguiente),
    reporteRepository.countProductosActivos(),
    reporteRepository.productosBajoStock(umbral),
  ]);

  return { ventasHoy, ventasMes, totalProductos, productosBajoStock };
}

// Serie por día. desde/hasta son Date | null; si faltan, últimos 30 días.
function ventasPorDia({ desde, hasta }) {
  const hoy = inicioDia(new Date());
  const hastaInclusive = hasta ? inicioDia(hasta) : hoy;
  const desdeBase = desde ? inicioDia(desde) : sumarDias(hastaInclusive, -29);
  // El límite superior es exclusivo: se suma un día para incluir todo "hasta".
  const finExclusivo = sumarDias(hastaInclusive, 1);

  return reporteRepository.ventasPorDia(desdeBase, finExclusivo);
}

function topProductos({ limite }) {
  return reporteRepository.topProductos(limite);
}

module.exports = { resumen, ventasPorDia, topProductos };
