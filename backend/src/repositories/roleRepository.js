// Acceso a datos de roles vía Prisma.
const { prisma } = require("../config/prisma");

function findByNombre(nombre) {
  return prisma.role.findUnique({ where: { nombre } });
}

module.exports = { findByNombre };
