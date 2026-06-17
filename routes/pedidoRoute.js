const express = require("express");
const PedidoController = require("../controllers/pedidoController");
const AuthMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

let ctrl = new PedidoController();
let auth = new AuthMiddleware();
router.post("/gravar", ctrl.gravar);
router.get("/", auth.verificarUsuarioLogado, ctrl.pedidosView);
router.get("/listar", auth.verificarUsuarioLogado, ctrl.listarPedidos);

module.exports = router;