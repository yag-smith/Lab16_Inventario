// Router raíz montado en /api. Aquí se irán enchufando los routers de cada módulo
// (auth, usuarios, categorias, productos, clientes, ventas, reportes).
// Todavía sin endpoints — se implementan en la siguiente etapa.
const { Router } = require("express");

const router = Router();

// Health check para verificar que la API responde.
router.get("/health", (req, res) => res.json({ status: "ok" }));

// TODO: montar routers de módulos, p. ej.:
// router.use("/auth", require("./auth.routes"));
// router.use("/productos", require("./productos.routes"));

module.exports = router;
