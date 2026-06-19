// Punto de entrada: arranca el servidor HTTP.
const { createApp } = require("./app");
const { env } = require("./config/env");

const app = createApp();

app.listen(env.port, () => {
  console.log(`API escuchando en http://localhost:${env.port}`);
});
