const express = require('express');
const router = express.Router();
const AgendamentoController = require('../controllers/agendamentoController');

const ctrl = new AgendamentoController();

router.get('/', async (req, res) => {
    await ctrl.index(req, res);
});

router.post('/cadastrar', async (req, res) => {
    await ctrl.cadastrar(req, res);
});

router.get('/admin', async (req, res) => {
    await ctrl.adminIndex(req, res);
});

router.post('/admin/status', async (req, res) => {
    await ctrl.adminAtualizarStatus(req, res);
});

router.post('/admin/reagendar', async (req, res) => {
    await ctrl.adminReagendar(req, res);
});

module.exports = router;
