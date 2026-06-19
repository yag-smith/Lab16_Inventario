// Instancia única (singleton) del cliente Prisma para toda la app.
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = { prisma };
