// Acceso a datos de categorías vía Prisma.
const { prisma } = require("../config/prisma");

function findAll() {
  return prisma.categoria.findMany({ orderBy: { nombre: "asc" } });
}

function findById(id) {
  return prisma.categoria.findUnique({ where: { id } });
}

function findByNombre(nombre) {
  return prisma.categoria.findUnique({ where: { nombre } });
}

function create({ nombre }) {
  return prisma.categoria.create({ data: { nombre } });
}

function update(id, { nombre }) {
  return prisma.categoria.update({ where: { id }, data: { nombre } });
}

function remove(id) {
  return prisma.categoria.delete({ where: { id } });
}

function countProductos(id) {
  return prisma.producto.count({ where: { categoriaId: id } });
}

module.exports = { findAll, findById, findByNombre, create, update, remove, countProductos };
