// Router raíz montado en /api. Aquí se irán enchufando los routers de cada módulo
// (auth, usuarios, categorias, productos, clientes, ventas, reportes).
// Todavía sin endpoints — se implementan en la siguiente etapa.
const { Router } = require("express");

const router = Router();

// Health check para verificar que la API responde.
router.get("/health", (req, res) => res.json({ status: "ok" }));

router.use("/auth", require("./authRoutes"));
router.use("/categorias", require("./categoriaRoutes"));
router.use("/productos", require("./productoRoutes"));
router.use("/clientes", require("./clienteRoutes"));
router.use("/ventas", require("./ventaRoutes"));

// TODO: montar routers de los demás módulos (reportes).

module.exports = router;
