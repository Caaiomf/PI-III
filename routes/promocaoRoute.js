const express = require('express');
const router = express.Router();
const PromocaoController = require('../controllers/promocaoController');

const ctrl = new PromocaoController();

router.get('/', async (req, res) => {
    await ctrl.index(req, res);
});

router.post('/definir', async (req, res) => {
    await ctrl.definir(req, res);
});

router.post('/remover', async (req, res) => {
    await ctrl.remover(req, res);
});

module.exports = router;
