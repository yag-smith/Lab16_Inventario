// Middleware central de errores. Va al final de la cadena en app.js.
// Permite lanzar errores con statusCode desde services/controllers.
function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const status = err.statusCode || 500;
  const message = status === 500 ? "Error interno del servidor" : err.message;

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
}

// 404 para rutas no definidas.
function notFound(req, res) {
  res.status(404).json({ error: "Recurso no encontrado" });
}

module.exports = { errorHandler, notFound };
