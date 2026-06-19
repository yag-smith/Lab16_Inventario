// Router raíz montado en /api. Aquí se irán enchufando los routers de cada módulo
// (auth, usuarios, categorias, productos, clientes, ventas, reportes).
// Todavía sin endpoints — se implementan en la siguiente etapa.
const { Router } = require("express");

const router = Router();

// Health check para verificar que la API responde.
router.get("/health", (req, res) => res.json({ status: "ok" }));

router.use("/auth", require("./authRoutes"));

// TODO: montar routers de los demás módulos:
// router.use("/productos", require("./productosRoutes"));

module.exports = router;
