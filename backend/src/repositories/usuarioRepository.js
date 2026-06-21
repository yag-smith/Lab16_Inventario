// Acceso a datos de usuarios vía Prisma. Única capa que toca la BD para usuarios.
const { prisma } = require("../config/prisma");

function findByEmail(email) {
  return prisma.usuario.findUnique({
    where: { email },
    include: { rol: true },
  });
}

function findById(id) {
  return prisma.usuario.findUnique({
    where: { id },
    include: { rol: true },
  });
}

function create({ nombre, email, password, rolId }) {
  return prisma.usuario.create({
    data: { nombre, email, password, rolId },
    include: { rol: true },
  });
}

// Actualiza el estado de bloqueo por intentos fallidos.
function updateLoginState(id, { failedAttempts, lockedUntil }) {
  return prisma.usuario.update({
    where: { id },
    data: { failedAttempts, lockedUntil },
    include: { rol: true },
  });
}

function findAll() {
  return prisma.usuario.findMany({
    include: { rol: true },
    orderBy: { id: "asc" },
  });
}

function updateRol(id, rolId) {
  return prisma.usuario.update({
    where: { id },
    data: { rolId },
    include: { rol: true },
  });
}

// Cuenta cuántos usuarios tienen el rol ADMIN (para no degradar al último).
function countAdmins() {
  return prisma.usuario.count({ where: { rol: { nombre: "ADMIN" } } });
}

module.exports = {
  findByEmail,
  findById,
  create,
  updateLoginState,
  findAll,
  updateRol,
  countAdmins,
};
