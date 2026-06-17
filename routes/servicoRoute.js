const express = require('express');
const ServicoController = require('../controllers/servicoController');

const router = express.Router();
const ctrl = new ServicoController();

router.get('/',              ctrl.listarView.bind(ctrl));
router.get('/cadastro',      ctrl.cadastroView.bind(ctrl));
router.post('/cadastro',     ctrl.cadastrar.bind(ctrl));
router.get('/alterar/:id',   ctrl.alterarView.bind(ctrl));
router.post('/alterar',      ctrl.alterar.bind(ctrl));
router.post('/excluir',      ctrl.excluir.bind(ctrl));

module.exports = router;
