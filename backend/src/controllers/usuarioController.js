// Controladores de usuarios: validan entrada y delegan en usuarioService.
const usuarioService = require("../services/usuarioService");

async function list(req, res, next) {
  try {
    res.json({ data: await usuarioService.list() });
  } catch (err) {
    next(err);
  }
}

async function cambiarRol(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Id inválido" });
    }

    const { rol } = req.body || {};
    if (typeof rol !== "string" || rol.trim().length === 0) {
      return res.status(400).json({ error: "El rol es obligatorio" });
    }

    const usuario = await usuarioService.cambiarRol(id, rol.trim().toUpperCase());
    res.json({ data: usuario });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, cambiarRol };
