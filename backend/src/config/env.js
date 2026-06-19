// Carga y validación centralizada de variables de entorno.
require("dotenv").config();

function required(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria: ${key}`);
  }
  return value;
}

const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  maxLoginAttempts: Number(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  lockMinutes: Number(process.env.LOCK_MINUTES) || 15,
};

module.exports = { env };
