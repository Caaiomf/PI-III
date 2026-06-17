const express = require('express');
const RecebimentoController = require('../controllers/recebimentoController');

const router = express.Router();
const ctrl = new RecebimentoController();

router.get('/', ctrl.index);
router.get('/listar', ctrl.listar);
router.post('/cadastrar', ctrl.cadastrar);

module.exports = router;
