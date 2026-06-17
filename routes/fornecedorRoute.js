const express = require('express');
const router = express.Router();
const FornecedorController = require('../controllers/fornecedorController');

const ctrl = new FornecedorController();

router.get('/', async (req, res) => {
    await ctrl.index(req, res);
});

router.post('/cadastrar', async (req, res) => {
    await ctrl.cadastrar(req, res);
});

module.exports = router;
