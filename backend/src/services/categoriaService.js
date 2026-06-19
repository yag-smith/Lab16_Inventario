// Lógica de negocio de categorías.
const categoriaRepository = require("../repositories/categoriaRepository");
const { httpError } = require("../utils/httpError");

function list() {
  return categoriaRepository.findAll();
}

async function getById(id) {
  const categoria = await categoriaRepository.findById(id);
  if (!categoria) {
    throw httpError(404, "Categoría no encontrada");
  }
  return categoria;
}

async function create({ nombre }) {
  const existente = await categoriaRepository.findByNombre(nombre);
  if (existente) {
    throw httpError(409, "Ya existe una categoría con ese nombre");
  }
  return categoriaRepository.create({ nombre });
}

async function update(id, { nombre }) {
  await getById(id); // 404 si no existe

  const existente = await categoriaRepository.findByNombre(nombre);
  if (existente && existente.id !== id) {
    throw httpError(409, "Ya existe una categoría con ese nombre");
  }
  return categoriaRepository.update(id, { nombre });
}

async function remove(id) {
  await getById(id); // 404 si no existe

  const productos = await categoriaRepository.countProductos(id);
  if (productos > 0) {
    throw httpError(409, "No se puede eliminar: la categoría tiene productos asociados");
  }
  return categoriaRepository.remove(id);
}

module.exports = { list, getById, create, update, remove };
