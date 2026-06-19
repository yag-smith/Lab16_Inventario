// Controladores de ventas: validan entrada y delegan en ventaService.
const ventaService = require("../services/ventaService");

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const ESTADOS = ["COMPLETADA", "ANULADA"];

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

async function create(req, res, next) {
  try {
    const { clienteId, items } = req.body || {};

    if (!Number.isInteger(clienteId) || clienteId <= 0) {
      return badRequest(res, "clienteId es obligatorio y debe ser un entero válido");
    }
    if (!Array.isArray(items) || items.length === 0) {
      return badRequest(res, "items es obligatorio y no puede estar vacío");
    }
    for (const item of items) {
      if (!item || typeof item !== "object") {
        return badRequest(res, "Cada item debe ser un objeto { productoId, cantidad }");
      }
      if (!Number.isInteger(item.productoId) || item.productoId <= 0) {
        return badRequest(res, "Cada item requiere un productoId entero válido");
      }
      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        return badRequest(res, "Cada item requiere una cantidad entera mayor que 0");
      }
    }

    const venta = await ventaService.create({
      clienteId,
      usuarioId: req.user.userId, // del token, nunca del body
      items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
    });
    res.status(201).json({ data: venta });
  } catch (err) {
    next(err);
  }
}

async function anular(req, res, next) {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    res.json({ data: await ventaService.anular(id) });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { estado } = req.query;
    if (estado !== undefined && !ESTADOS.includes(estado)) {
      return badRequest(res, "estado debe ser COMPLETADA o ANULADA");
    }

    let page = Number(req.query.page) || 1;
    if (page < 1) page = 1;
    let pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;
    if (pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
    if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

    const result = await ventaService.list({
      rol: req.user.rol,
      userId: req.user.userId,
      estado,
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
    const venta = await ventaService.getById(id, {
      rol: req.user.rol,
      userId: req.user.userId,
    });
    res.json({ data: venta });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, anular, list, getById };
