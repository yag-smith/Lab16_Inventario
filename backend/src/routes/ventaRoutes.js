// Rutas de ventas. Lectura/registro: ADMIN y VENDEDOR. Anular: solo ADMIN.
const { Router } = require("express");
const ventaController = require("../controllers/ventaController");
const { auth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/roles");

const router = Router();

router.get("/", auth, ventaController.list);
router.get("/:id", auth, ventaController.getById);
router.post("/", auth, ventaController.create);
router.patch("/:id/anular", auth, requireRole("ADMIN"), ventaController.anular);

module.exports = router;
