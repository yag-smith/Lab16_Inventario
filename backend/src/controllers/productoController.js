// Controladores de productos: validan entrada y delegan en productoService.
const productoService = require("../services/productoService");

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    badRequest(res, "Id inválido");
    return null;
  }
  return id;
}

// Valida los campos del body para create (todos obligatorios salvo descripcion/categoriaId).
function validarCreate(body, res) {
  const { nombre, descripcion, precio, stock, categoriaId } = body;

  if (typeof nombre !== "string" || nombre.trim().length < 2) {
    return badRequest(res, "El nombre es obligatorio (mínimo 2 caracteres)"), null;
  }
  if (typeof precio !== "number" || Number.isNaN(precio)) {
    return badRequest(res, "El precio es obligatorio y debe ser numérico"), null;
  }
  if (!Number.isInteger(stock)) {
    return badRequest(res, "El stock es obligatorio y debe ser entero"), null;
  }
  if (categoriaId !== undefined && categoriaId !== null && !Number.isInteger(categoriaId)) {
    return badRequest(res, "categoriaId debe ser un entero"), null;
  }
  if (descripcion !== undefined && descripcion !== null && typeof descripcion !== "string") {
    return badRequest(res, "descripcion debe ser texto"), null;
  }

  return {
    nombre: nombre.trim(),
    descripcion: descripcion ?? null,
    precio,
    stock,
    categoriaId: categoriaId ?? null,
  };
}

// Valida los campos del body para update (todos opcionales, pero con tipos correctos).
function validarUpdate(body, res) {
  const { nombre, descripcion, precio, stock, categoriaId } = body;
  const data = {};

  if (nombre !== undefined) {
    if (typeof nombre !== "string" || nombre.trim().length < 2) {
      return badRequest(res, "El nombre debe tener al menos 2 caracteres"), null;
    }
    data.nombre = nombre.trim();
  }
  if (precio !== undefined) {
    if (typeof precio !== "number" || Number.isNaN(precio)) {
      return badRequest(res, "El precio debe ser numérico"), null;
    }
    data.precio = precio;
  }
  if (stock !== undefined) {
    if (!Number.isInteger(stock)) {
      return badRequest(res, "El stock debe ser entero"), null;
    }
    data.stock = stock;
  }
  if (categoriaId !== undefined) {
    if (categoriaId !== null && !Number.isInteger(categoriaId)) {
      return badRequest(res, "categoriaId debe ser un entero o null"), null;
    }
    data.categoriaId = categoriaId;
  }
  if (descripcion !== undefined) {
    if (descripcion !== null && typeof descripcion !== "string") {
      return badRequest(res, "descripcion debe ser texto o null"), null;
    }
    data.descripcion = descripcion;
  }

  if (Object.keys(data).length === 0) {
    return badRequest(res, "No hay campos para actualizar"), null;
  }
  return data;
}

async function list(req, res, next) {
  try {
    const { q, categoria } = req.query;

    let categoriaId;
    if (categoria !== undefined) {
      categoriaId = Number(categoria);
      if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
        return badRequest(res, "categoria debe ser un id entero");
      }
    }

    let page = Number(req.query.page) || 1;
    if (page < 1) page = 1;
    let pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;
    if (pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
    if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

    const result = await productoService.list({
      q: typeof q === "string" && q.trim() ? q.trim() : undefined,
      categoriaId,
      page,
      pageSize,
    });

    res.json({
      data: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    res.json({ data: await productoService.getById(id) });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = validarCreate(req.body || {}, res);
    if (data === null) return;
    res.status(201).json({ data: await productoService.create(data) });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    const data = validarUpdate(req.body || {}, res);
    if (data === null) return;
    res.json({ data: await productoService.update(id, data) });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    res.json({ data: await productoService.remove(id) });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
