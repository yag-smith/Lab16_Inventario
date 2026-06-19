// Controladores de clientes: validan entrada y delegan en clienteService.
const clienteService = require("../services/clienteService");

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

// Valida un campo de texto opcional (email, telefono): null o string.
function validarOpcional(valor, campo, res) {
  if (valor !== undefined && valor !== null && typeof valor !== "string") {
    badRequest(res, `${campo} debe ser texto`);
    return false;
  }
  return true;
}

async function list(req, res, next) {
  try {
    const { q } = req.query;

    let page = Number(req.query.page) || 1;
    if (page < 1) page = 1;
    let pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;
    if (pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
    if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

    const result = await clienteService.list({
      q: typeof q === "string" && q.trim() ? q.trim() : undefined,
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
    res.json({ data: await clienteService.getById(id) });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { nombre, tipoDoc, numDoc, email, telefono } = req.body || {};

    if (typeof nombre !== "string" || nombre.trim().length < 2) {
      return badRequest(res, "El nombre es obligatorio (mínimo 2 caracteres)");
    }
    if (typeof numDoc !== "string" || numDoc.trim().length === 0) {
      return badRequest(res, "El número de documento es obligatorio");
    }
    if (tipoDoc !== undefined && typeof tipoDoc !== "string") {
      return badRequest(res, "tipoDoc debe ser texto");
    }
    if (!validarOpcional(email, "email", res)) return;
    if (!validarOpcional(telefono, "telefono", res)) return;

    const data = await clienteService.create({
      nombre: nombre.trim(),
      tipoDoc: tipoDoc ? tipoDoc.trim().toUpperCase() : undefined,
      numDoc: numDoc.trim(),
      email: email ?? null,
      telefono: telefono ?? null,
    });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req, res);
    if (id === null) return;

    const { nombre, tipoDoc, numDoc, email, telefono } = req.body || {};
    const data = {};

    if (nombre !== undefined) {
      if (typeof nombre !== "string" || nombre.trim().length < 2) {
        return badRequest(res, "El nombre debe tener al menos 2 caracteres");
      }
      data.nombre = nombre.trim();
    }
    if (numDoc !== undefined) {
      if (typeof numDoc !== "string" || numDoc.trim().length === 0) {
        return badRequest(res, "El número de documento no puede estar vacío");
      }
      data.numDoc = numDoc.trim();
    }
    if (tipoDoc !== undefined) {
      if (typeof tipoDoc !== "string") {
        return badRequest(res, "tipoDoc debe ser texto");
      }
      data.tipoDoc = tipoDoc.trim().toUpperCase();
    }
    if (email !== undefined) {
      if (!validarOpcional(email, "email", res)) return;
      data.email = email;
    }
    if (telefono !== undefined) {
      if (!validarOpcional(telefono, "telefono", res)) return;
      data.telefono = telefono;
    }

    if (Object.keys(data).length === 0) {
      return badRequest(res, "No hay campos para actualizar");
    }

    res.json({ data: await clienteService.update(id, data) });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    await clienteService.remove(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
