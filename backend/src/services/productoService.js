// Lógica de negocio de productos.
const productoRepository = require("../repositories/productoRepository");
const categoriaRepository = require("../repositories/categoriaRepository");
const { httpError } = require("../utils/httpError");

// Verifica que la categoría exista cuando se envía un categoriaId.
async function assertCategoria(categoriaId) {
  if (categoriaId === undefined || categoriaId === null) return;
  const categoria = await categoriaRepository.findById(categoriaId);
  if (!categoria) {
    throw httpError(400, "La categoría indicada no existe");
  }
}

// Listado paginado. Por defecto solo productos activos.
async function list({ q, categoriaId, page, pageSize }) {
  const { data, total } = await productoRepository.findMany({
    q,
    categoriaId,
    activo: true,
    page,
    pageSize,
  });
  return { data, total, page, pageSize };
}

async function getById(id) {
  const producto = await productoRepository.findById(id);
  if (!producto) {
    throw httpError(404, "Producto no encontrado");
  }
  return producto;
}

async function create({ nombre, descripcion, precio, stock, categoriaId }) {
  if (precio < 0) throw httpError(400, "El precio no puede ser negativo");
  if (stock < 0) throw httpError(400, "El stock no puede ser negativo");
  await assertCategoria(categoriaId);

  return productoRepository.create({
    nombre,
    descripcion: descripcion ?? null,
    precio,
    stock,
    categoriaId: categoriaId ?? null,
  });
}

async function update(id, { nombre, descripcion, precio, stock, categoriaId }) {
  await getById(id); // 404 si no existe

  if (precio !== undefined && precio < 0) throw httpError(400, "El precio no puede ser negativo");
  if (stock !== undefined && stock < 0) throw httpError(400, "El stock no puede ser negativo");
  if (categoriaId !== undefined && categoriaId !== null) await assertCategoria(categoriaId);

  // Solo actualiza los campos provistos.
  const data = {};
  if (nombre !== undefined) data.nombre = nombre;
  if (descripcion !== undefined) data.descripcion = descripcion;
  if (precio !== undefined) data.precio = precio;
  if (stock !== undefined) data.stock = stock;
  if (categoriaId !== undefined) data.categoriaId = categoriaId;

  return productoRepository.update(id, data);
}

async function remove(id) {
  await getById(id); // 404 si no existe
  return productoRepository.softDelete(id);
}

module.exports = { list, getById, create, update, remove };
