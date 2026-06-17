const express = require('express');
const LoginController = require('../controllers/loginController');

const router = express.Router();

let ctrl = new LoginController();
router.get('/', ctrl.loginView);
router.post('/cliente', ctrl.loginCliente);
router.post('/funcionario', ctrl.loginFuncionario);
router.post('/cadastro-cliente', ctrl.cadastrarCliente);
router.post('/validar', ctrl.loginFuncionario);


module.exports = router;
