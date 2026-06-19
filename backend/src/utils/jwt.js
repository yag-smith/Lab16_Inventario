// Firma y verificación de JWT (HS256) con userId y rol en el payload.
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { algorithm: "HS256", expiresIn: "8h" });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { signToken, verifyToken };
