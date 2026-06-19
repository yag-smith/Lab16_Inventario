// Controladores de categorías: validan entrada y delegan en categoriaService.
const categoriaService = require("../services/categoriaService");

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

// Valida y normaliza el id de la ruta.
function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    badRequest(res, "Id inválido");
    return null;
  }
  return id;
}

function validarNombre(nombre, res) {
  if (typeof nombre !== "string" || nombre.trim().length < 2) {
    badRequest(res, "El nombre es obligatorio (mínimo 2 caracteres)");
    return null;
  }
  return nombre.trim();
}

async function list(req, res, next) {
  try {
    res.json({ data: await categoriaService.list() });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const nombre = validarNombre((req.body || {}).nombre, res);
    if (nombre === null) return;
    res.status(201).json({ data: await categoriaService.create({ nombre }) });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    const nombre = validarNombre((req.body || {}).nombre, res);
    if (nombre === null) return;
    res.json({ data: await categoriaService.update(id, { nombre }) });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    await categoriaService.remove(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
