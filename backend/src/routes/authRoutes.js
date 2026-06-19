// Rutas de autenticación. /me requiere JWT válido.
const { Router } = require("express");
const authController = require("../controllers/authController");
const { auth } = require("../middlewares/auth");

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", auth, authController.me);

module.exports = router;
