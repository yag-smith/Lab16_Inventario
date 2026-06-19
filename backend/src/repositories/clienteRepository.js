// Acceso a datos de clientes vía Prisma.
const { prisma } = require("../config/prisma");

// Listado con filtro (q por nombre o numDoc) y paginación.
// Devuelve { data, total } para que el service arme la metadata.
async function findMany({ q, page, pageSize }) {
  const where = q
    ? {
        OR: [
          { nombre: { contains: q, mode: "insensitive" } },
          { numDoc: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.cliente.count({ where }),
  ]);

  return { data, total };
}

function findById(id) {
  return prisma.cliente.findUnique({ where: { id } });
}

function findByNumDoc(numDoc) {
  return prisma.cliente.findUnique({ where: { numDoc } });
}

function create(data) {
  return prisma.cliente.create({ data });
}

function update(id, data) {
  return prisma.cliente.update({ where: { id }, data });
}

function remove(id) {
  return prisma.cliente.delete({ where: { id } });
}

module.exports = { findMany, findById, findByNumDoc, create, update, remove };
