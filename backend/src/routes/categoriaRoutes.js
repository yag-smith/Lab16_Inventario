// Rutas de categorías. Lectura: ADMIN y VENDEDOR. Escritura: solo ADMIN.
const { Router } = require("express");
const categoriaController = require("../controllers/categoriaController");
const { auth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/roles");

const router = Router();

router.get("/", auth, categoriaController.list);
router.post("/", auth, requireRole("ADMIN"), categoriaController.create);
router.put("/:id", auth, requireRole("ADMIN"), categoriaController.update);
router.delete("/:id", auth, requireRole("ADMIN"), categoriaController.remove);

module.exports = router;
