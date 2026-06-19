// Verifica el JWT del header Authorization: Bearer <token>.
// Adjunta { userId, rol } a req.user. No autoriza por rol (eso es roles.js).
const { verifyToken } = require("../utils/jwt");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token no provisto" });
  }

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId, rol: payload.rol };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

module.exports = { auth };
