const express = require('express');
const router = express.Router();
const DescarteController = require('../controllers/descarteController');

const ctrl = new DescarteController();

router.get('/', async (req, res) => {
    await ctrl.index(req, res);
});

router.post('/empresas/cadastrar', async (req, res) => {
    await ctrl.cadastrarEmpresa(req, res);
});

router.post('/registrar', async (req, res) => {
    await ctrl.registrar(req, res);
});

module.exports = router;
