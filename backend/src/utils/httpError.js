// Crea un Error con statusCode para que lo formatee el middleware errorHandler.
function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = { httpError };
