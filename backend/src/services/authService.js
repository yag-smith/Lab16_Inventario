// Lógica de negocio de autenticación: registro, login con lockout y perfil.
const usuarioRepository = require("../repositories/usuarioRepository");
const roleRepository = require("../repositories/roleRepository");
const { hashPassword, comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");
const { env } = require("../config/env");

// Crea un Error con statusCode para que lo formatee errorHandler.
function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// Devuelve el usuario sin el hash de contraseña y con el rol como string.
function sanitizeUsuario(usuario) {
  const { password, rol, rolId, ...resto } = usuario;
  return { ...resto, rol: rol ? rol.nombre : undefined };
}

async function register({ nombre, email, password }) {
  const existente = await usuarioRepository.findByEmail(email);
  if (existente) {
    throw httpError(409, "El email ya está registrado");
  }

  const rolVendedor = await roleRepository.findByNombre("VENDEDOR");
  if (!rolVendedor) {
    throw httpError(500, "Rol VENDEDOR no encontrado; ejecuta el seed");
  }

  const hash = await hashPassword(password);
  const usuario = await usuarioRepository.create({
    nombre,
    email,
    password: hash,
    rolId: rolVendedor.id,
  });

  return sanitizeUsuario(usuario);
}

async function login({ email, password }) {
  const usuario = await usuarioRepository.findByEmail(email);
  // Mensaje genérico para no revelar si el email existe.
  if (!usuario || !usuario.password) {
    throw httpError(401, "Credenciales inválidas");
  }

  // ¿Cuenta bloqueada?
  if (usuario.lockedUntil && usuario.lockedUntil > new Date()) {
    throw httpError(423, "Cuenta bloqueada temporalmente por intentos fallidos");
  }

  const coincide = await comparePassword(password, usuario.password);

  if (!coincide) {
    const failedAttempts = usuario.failedAttempts + 1;
    const alcanzaLimite = failedAttempts >= env.maxLoginAttempts;
    const lockedUntil = alcanzaLimite
      ? new Date(Date.now() + env.lockMinutes * 60 * 1000)
      : null;

    await usuarioRepository.updateLoginState(usuario.id, { failedAttempts, lockedUntil });

    if (alcanzaLimite) {
      throw httpError(423, "Cuenta bloqueada temporalmente por intentos fallidos");
    }
    throw httpError(401, "Credenciales inválidas");
  }

  // Login correcto: resetea el contador si hacía falta.
  if (usuario.failedAttempts !== 0 || usuario.lockedUntil) {
    await usuarioRepository.updateLoginState(usuario.id, { failedAttempts: 0, lockedUntil: null });
  }

  const accessToken = signToken({ userId: usuario.id, rol: usuario.rol.nombre });

  return { user: sanitizeUsuario(usuario), accessToken };
}

async function me(userId) {
  const usuario = await usuarioRepository.findById(userId);
  if (!usuario) {
    throw httpError(404, "Usuario no encontrado");
  }
  return sanitizeUsuario(usuario);
}

module.exports = { register, login, me };
