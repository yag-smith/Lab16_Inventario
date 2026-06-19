// Lógica de negocio de ventas. La transacción atómica vive en el repositorio.
const ventaRepository = require("../repositories/ventaRepository");
const { httpError } = require("../utils/httpError");

const ROL_ADMIN = "ADMIN";

// Registra una venta. usuarioId siempre viene del token, nunca del body.
function create({ clienteId, usuarioId, items }) {
  return ventaRepository.createVenta({ clienteId, usuarioId, items });
}

function anular(id) {
  return ventaRepository.anularVenta(id);
}

// ADMIN ve todas; VENDEDOR solo las suyas.
async function list({ rol, userId, estado, page, pageSize }) {
  const usuarioId = rol === ROL_ADMIN ? undefined : userId;
  const { data, total } = await ventaRepository.findMany({ usuarioId, estado, page, pageSize });
  return { data, total, page, pageSize };
}

// ADMIN cualquiera; VENDEDOR solo si la venta es suya.
async function getById(id, { rol, userId }) {
  const venta = await ventaRepository.findById(id);
  if (!venta) {
    throw httpError(404, "Venta no encontrada");
  }
  if (rol !== ROL_ADMIN && venta.usuarioId !== userId) {
    throw httpError(403, "No tienes permiso para ver esta venta");
  }
  return venta;
}

module.exports = { create, anular, list, getById };
