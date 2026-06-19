// Acceso a datos de reportes vía Prisma. Solo cuentan ventas COMPLETADA.
// Las agregaciones por día y el top de productos usan $queryRaw (PostgreSQL).
const { prisma } = require("../config/prisma");

// Suma y cantidad de ventas COMPLETADA en [desde, hasta).
async function aggregateVentas(desde, hasta) {
  const r = await prisma.venta.aggregate({
    where: { estado: "COMPLETADA", fecha: { gte: desde, lt: hasta } },
    _sum: { total: true },
    _count: true,
  });
  return { total: r._sum.total ? Number(r._sum.total) : 0, cantidad: r._count };
}

function countProductosActivos() {
  return prisma.producto.count({ where: { activo: true } });
}

function productosBajoStock(umbral) {
  return prisma.producto.findMany({
    where: { activo: true, stock: { lte: umbral } },
    select: { id: true, nombre: true, stock: true },
    orderBy: { stock: "asc" },
  });
}

// Ventas COMPLETADA agrupadas por día en [desde, hasta). COUNT devuelve BigInt
// y SUM devuelve Decimal: se normalizan a number para el gráfico.
async function ventasPorDia(desde, hasta) {
  const rows = await prisma.$queryRaw`
    SELECT to_char(date_trunc('day', fecha), 'YYYY-MM-DD') AS fecha,
           SUM(total) AS total,
           COUNT(*)   AS cantidad
    FROM ventas
    WHERE estado = 'COMPLETADA'
      AND fecha >= ${desde}
      AND fecha <  ${hasta}
    GROUP BY date_trunc('day', fecha)
    ORDER BY date_trunc('day', fecha) ASC
  `;
  return rows.map((r) => ({
    fecha: r.fecha,
    total: Number(r.total),
    cantidad: Number(r.cantidad),
  }));
}

// Productos más vendidos por cantidad, sumando sobre el detalle de ventas COMPLETADA.
async function topProductos(limite) {
  const rows = await prisma.$queryRaw`
    SELECT dv.producto_id          AS "productoId",
           p.nombre                AS nombre,
           SUM(dv.cantidad)        AS "cantidadVendida",
           SUM(dv.subtotal)        AS "totalVendido"
    FROM detalle_venta dv
    JOIN ventas    v ON v.id = dv.venta_id
    JOIN productos p ON p.id = dv.producto_id
    WHERE v.estado = 'COMPLETADA'
    GROUP BY dv.producto_id, p.nombre
    ORDER BY SUM(dv.cantidad) DESC
    LIMIT ${limite}
  `;
  return rows.map((r) => ({
    productoId: Number(r.productoId),
    nombre: r.nombre,
    cantidadVendida: Number(r.cantidadVendida),
    totalVendido: Number(r.totalVendido),
  }));
}

module.exports = {
  aggregateVentas,
  countProductosActivos,
  productosBajoStock,
  ventasPorDia,
  topProductos,
};
