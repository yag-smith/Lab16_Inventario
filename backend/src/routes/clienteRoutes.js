// Rutas de clientes. Lectura/creación/edición: ADMIN y VENDEDOR. Eliminar: solo ADMIN.
const { Router } = require("express");
const clienteController = require("../controllers/clienteController");
const { auth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/roles");

const router = Router();

router.get("/", auth, clienteController.list);
router.get("/:id", auth, clienteController.getById);
router.post("/", auth, clienteController.create);
router.put("/:id", auth, clienteController.update);
router.delete("/:id", auth, requireRole("ADMIN"), clienteController.remove);

module.exports = router;
