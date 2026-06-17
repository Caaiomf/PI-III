const express = require('express');
const router = express.Router();
const CompraController = require('../controllers/compraController');

const ctrl = new CompraController();

router.get('/', async (req, res) => {
    await ctrl.index(req, res);
});

router.get('/listar', async (req, res) => {
    await ctrl.listar(req, res);
});

router.post('/cadastrar', async (req, res) => {
    await ctrl.cadastrar(req, res);
});

router.post('/excluir', async (req, res) => {
    await ctrl.excluir(req, res);
});

router.get('/obter/:id', async (req, res) => {
    await ctrl.obter(req, res);
});

router.post('/atualizar', async (req, res) => {
    await ctrl.atualizar(req, res);
});

router.post('/status', async (req, res) => {
    await ctrl.atualizarStatus(req, res);
});

module.exports = router;
