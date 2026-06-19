// Configuración de CORS. El origen permitido viene de CORS_ORIGIN.
const { env } = require("./env");

const corsOptions = {
  origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(",").map((o) => o.trim()),
  credentials: true,
};

module.exports = { corsOptions };
