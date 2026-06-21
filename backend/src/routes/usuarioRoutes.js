// Rutas de usuarios. Todo el módulo es solo para ADMIN.
const { Router } = require("express");
const usuarioController = require("../controllers/usuarioController");
const { auth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/roles");

const router = Router();

router.get("/", auth, requireRole("ADMIN"), usuarioController.list);
router.patch("/:id/rol", auth, requireRole("ADMIN"), usuarioController.cambiarRol);

module.exports = router;
