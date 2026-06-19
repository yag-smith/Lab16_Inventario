// Rutas de productos. Lectura: ADMIN y VENDEDOR. Escritura: solo ADMIN.
const { Router } = require("express");
const productoController = require("../controllers/productoController");
const { auth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/roles");

const router = Router();

router.get("/", auth, productoController.list);
router.get("/:id", auth, productoController.getById);
router.post("/", auth, requireRole("ADMIN"), productoController.create);
router.put("/:id", auth, requireRole("ADMIN"), productoController.update);
router.delete("/:id", auth, requireRole("ADMIN"), productoController.remove);

module.exports = router;
