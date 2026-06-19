// Seed: roles base (ADMIN, VENDEDOR) + usuario admin + datos demo.
// Ejecutar con: npx prisma db seed  (configurado en package.json)
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Roles base
  const [admin, vendedor] = await Promise.all([
    prisma.role.upsert({ where: { nombre: "ADMIN" }, update: {}, create: { nombre: "ADMIN" } }),
    prisma.role.upsert({ where: { nombre: "VENDEDOR" }, update: {}, create: { nombre: "VENDEDOR" } }),
  ]);

  // Usuario admin (credenciales por defecto; cambiar en producción)
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.usuario.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      nombre: "Administrador",
      email: "admin@demo.com",
      password: passwordHash,
      rolId: admin.id,
    },
  });

  // Datos demo: categorías y productos
  const categoria = await prisma.categoria.upsert({
    where: { nombre: "General" },
    update: {},
    create: { nombre: "General" },
  });

  await prisma.producto.createMany({
    data: [
      { nombre: "Producto demo A", precio: 19.9, stock: 50, categoriaId: categoria.id },
      { nombre: "Producto demo B", precio: 5.5, stock: 8, categoriaId: categoria.id },
    ],
    skipDuplicates: true,
  });

  // Cliente demo
  await prisma.cliente.upsert({
    where: { numDoc: "00000000" },
    update: {},
    create: { nombre: "Cliente demo", tipoDoc: "DNI", numDoc: "00000000" },
  });

  console.log("Seed completado: roles, admin@demo.com (admin123), datos demo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
