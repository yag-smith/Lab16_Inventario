// Acceso a datos de ventas vía Prisma. Aquí vive la lógica transaccional:
// registrar una venta (descuenta stock) y anularla (repone stock) de forma atómica.
const { Prisma } = require("@prisma/client");
const { prisma } = require("../config/prisma");
const { httpError } = require("../utils/httpError");

// Include reutilizable: usuario sin password, detalle con producto.
const ventaCompletaInclude = {
  cliente: true,
  usuario: { select: { id: true, nombre: true, email: true } },
  detalles: { include: { producto: true } },
};

// Registra una venta dentro de una transacción atómica.
// Si cualquier item falla (cliente/producto inexistente, stock insuficiente),
// se hace rollback completo: no se crea la venta ni se descuenta stock.
function createVenta({ clienteId, usuarioId, items }) {
  return prisma.$transaction(async (tx) => {
    const cliente = await tx.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) {
      throw httpError(404, "El cliente indicado no existe");
    }

    let total = new Prisma.Decimal(0);
    const detalles = [];

    for (const item of items) {
      const producto = await tx.producto.findUnique({ where: { id: item.productoId } });
      if (!producto || !producto.activo) {
        throw httpError(400, `Producto inexistente o inactivo (id ${item.productoId})`);
      }
      if (producto.stock < item.cantidad) {
        throw httpError(409, `Stock insuficiente para ${producto.nombre}`);
      }

      // Snapshot del precio al momento de la venta.
      const precioUnitario = producto.precio; // Prisma.Decimal
      const subtotal = precioUnitario.mul(item.cantidad);
      total = total.add(subtotal);

      detalles.push({
        productoId: producto.id,
        cantidad: item.cantidad,
        precioUnitario,
        subtotal,
      });
    }

    const venta = await tx.venta.create({
      data: {
        clienteId,
        usuarioId,
        total,
        estado: "COMPLETADA",
        detalles: { create: detalles },
      },
    });

    // Descuenta el stock de cada producto vendido.
    for (const item of items) {
      await tx.producto.update({
        where: { id: item.productoId },
        data: { stock: { decrement: item.cantidad } },
      });
    }

    return tx.venta.findUnique({
      where: { id: venta.id },
      include: ventaCompletaInclude,
    });
  });
}

// Anula una venta y repone el stock, atómicamente.
function anularVenta(id) {
  return prisma.$transaction(async (tx) => {
    const venta = await tx.venta.findUnique({
      where: { id },
      include: { detalles: true },
    });
    if (!venta) {
      throw httpError(404, "Venta no encontrada");
    }
    if (venta.estado === "ANULADA") {
      throw httpError(409, "La venta ya está anulada");
    }

    await tx.venta.update({ where: { id }, data: { estado: "ANULADA" } });

    // Repone el stock de cada producto del detalle.
    for (const detalle of venta.detalles) {
      await tx.producto.update({
        where: { id: detalle.productoId },
        data: { stock: { increment: detalle.cantidad } },
      });
    }

    return tx.venta.findUnique({
      where: { id },
      include: ventaCompletaInclude,
    });
  });
}

// Listado paginado. Si se pasa usuarioId, filtra solo las ventas de ese vendedor.
async function findMany({ usuarioId, estado, page, pageSize }) {
  const where = {};
  if (usuarioId !== undefined) where.usuarioId = usuarioId;
  if (estado !== undefined) where.estado = estado;

  const [data, total] = await Promise.all([
    prisma.venta.findMany({
      where,
      include: { cliente: true },
      orderBy: { fecha: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.venta.count({ where }),
  ]);

  return { data, total };
}

function findById(id) {
  return prisma.venta.findUnique({
    where: { id },
    include: ventaCompletaInclude,
  });
}

module.exports = { createVenta, anularVenta, findMany, findById };
