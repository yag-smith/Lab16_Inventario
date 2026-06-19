// Lógica de negocio de clientes.
const clienteRepository = require("../repositories/clienteRepository");
const { httpError } = require("../utils/httpError");

const TIPOS_DOC = ["DNI", "RUC", "CE"];

// Listado paginado con filtro por nombre o numDoc.
async function list({ q, page, pageSize }) {
  const { data, total } = await clienteRepository.findMany({ q, page, pageSize });
  return { data, total, page, pageSize };
}

async function getById(id) {
  const cliente = await clienteRepository.findById(id);
  if (!cliente) {
    throw httpError(404, "Cliente no encontrado");
  }
  return cliente;
}

async function create({ nombre, tipoDoc, numDoc, email, telefono }) {
  const tipo = tipoDoc ?? "DNI";
  if (!TIPOS_DOC.includes(tipo)) {
    throw httpError(400, "tipoDoc debe ser uno de: DNI, RUC, CE");
  }

  const existente = await clienteRepository.findByNumDoc(numDoc);
  if (existente) {
    throw httpError(409, "Ya existe un cliente con ese número de documento");
  }

  return clienteRepository.create({
    nombre,
    tipoDoc: tipo,
    numDoc,
    email: email ?? null,
    telefono: telefono ?? null,
  });
}

async function update(id, { nombre, tipoDoc, numDoc, email, telefono }) {
  await getById(id); // 404 si no existe

  if (tipoDoc !== undefined && !TIPOS_DOC.includes(tipoDoc)) {
    throw httpError(400, "tipoDoc debe ser uno de: DNI, RUC, CE");
  }

  if (numDoc !== undefined) {
    const existente = await clienteRepository.findByNumDoc(numDoc);
    if (existente && existente.id !== id) {
      throw httpError(409, "Ya existe un cliente con ese número de documento");
    }
  }

  // Solo actualiza los campos provistos.
  const data = {};
  if (nombre !== undefined) data.nombre = nombre;
  if (tipoDoc !== undefined) data.tipoDoc = tipoDoc;
  if (numDoc !== undefined) data.numDoc = numDoc;
  if (email !== undefined) data.email = email;
  if (telefono !== undefined) data.telefono = telefono;

  return clienteRepository.update(id, data);
}

async function remove(id) {
  await getById(id); // 404 si no existe
  return clienteRepository.remove(id);
}

module.exports = { list, getById, create, update, remove };
