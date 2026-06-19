// Crea la app Express, monta middlewares globales y el router /api.
const express = require("express");
const cors = require("cors");

const { corsOptions } = require("./config/cors");
const apiRouter = require("./routes");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

function createApp() {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json());

  app.use("/api", apiRouter);

  // Manejo de rutas no encontradas y errores (siempre al final).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
