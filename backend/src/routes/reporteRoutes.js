// Rutas de reportes. Todas de lectura: ADMIN y VENDEDOR (solo requieren auth).
const { Router } = require("express");
const reporteController = require("../controllers/reporteController");
const { auth } = require("../middlewares/auth");

const router = Router();

router.get("/resumen", auth, reporteController.resumen);
router.get("/ventas-por-dia", auth, reporteController.ventasPorDia);
router.get("/top-productos", auth, reporteController.topProductos);

module.exports = router;
