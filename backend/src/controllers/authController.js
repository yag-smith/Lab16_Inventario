// Controladores de auth: validan la entrada y delegan en authService.
const authService = require("../services/authService");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

async function register(req, res, next) {
  try {
    const { nombre, email, password } = req.body || {};

    if (typeof nombre !== "string" || nombre.trim().length < 2) {
      return badRequest(res, "El nombre es obligatorio (mínimo 2 caracteres)");
    }
    if (typeof email !== "string" || !EMAIL_RE.test(email)) {
      return badRequest(res, "Email inválido");
    }
    if (typeof password !== "string" || password.length < 6) {
      return badRequest(res, "La contraseña debe tener al menos 6 caracteres");
    }

    const user = await authService.register({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      password,
    });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== "string" || !EMAIL_RE.test(email)) {
      return badRequest(res, "Email inválido");
    }
    if (typeof password !== "string" || password.length === 0) {
      return badRequest(res, "La contraseña es obligatoria");
    }

    const result = await authService.login({
      email: email.toLowerCase().trim(),
      password,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.me(req.user.userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
