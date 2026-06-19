// Acceso a datos de productos vía Prisma.
const { prisma } = require("../config/prisma");

// Listado con filtros (q por nombre, categoriaId, activo) y paginación.
// Devuelve { data, total } para que el service arme la metadata.
async function findMany({ q, categoriaId, activo, page, pageSize }) {
  const where = {};
  if (activo !== undefined) where.activo = activo;
  if (categoriaId !== undefined) where.categoriaId = categoriaId;
  if (q) where.nombre = { contains: q, mode: "insensitive" };

  const [data, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { categoria: true },
      orderBy: { id: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.producto.count({ where }),
  ]);

  return { data, total };
}

function findById(id) {
  return prisma.producto.findUnique({
    where: { id },
    include: { categoria: true },
  });
}

function create(data) {
  return prisma.producto.create({ data, include: { categoria: true } });
}

function update(id, data) {
  return prisma.producto.update({ where: { id }, data, include: { categoria: true } });
}

// Baja lógica: activo = false.
function softDelete(id) {
  return prisma.producto.update({
    where: { id },
    data: { activo: false },
    include: { categoria: true },
  });
}

module.exports = { findMany, findById, create, update, softDelete };
