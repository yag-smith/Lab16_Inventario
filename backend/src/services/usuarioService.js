// Lógica de negocio de usuarios (gestión de roles, solo ADMIN).
const usuarioRepository = require("../repositories/usuarioRepository");
const roleRepository = require("../repositories/roleRepository");
const { httpError } = require("../utils/httpError");

const ROLES_VALIDOS = ["ADMIN", "VENDEDOR"];

// Devuelve el usuario sin el hash de contraseña y con el rol como string.
function sanitize(usuario) {
  const { password, rol, rolId, ...resto } = usuario;
  return { ...resto, rol: rol ? rol.nombre : undefined };
}

async function list() {
  const usuarios = await usuarioRepository.findAll();
  return usuarios.map(sanitize);
}

async function cambiarRol(id, nombreRol) {
  if (!ROLES_VALIDOS.includes(nombreRol)) {
    throw httpError(400, "Rol inválido; debe ser ADMIN o VENDEDOR");
  }

  const usuario = await usuarioRepository.findById(id);
  if (!usuario) {
    throw httpError(404, "Usuario no encontrado");
  }

  const rol = await roleRepository.findByNombre(nombreRol);
  if (!rol) {
    throw httpError(500, `Rol ${nombreRol} no encontrado; ejecuta el seed`);
  }

  // No degradar al último ADMIN que queda.
  if (usuario.rol?.nombre === "ADMIN" && nombreRol === "VENDEDOR") {
    const admins = await usuarioRepository.countAdmins();
    if (admins <= 1) {
      throw httpError(409, "Debe existir al menos un administrador");
    }
  }

  const actualizado = await usuarioRepository.updateRol(id, rol.id);
  return sanitize(actualizado);
}

module.exports = { list, cambiarRol };
