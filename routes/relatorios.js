const express = require('express');
const router = express.Router();
const RelatorioController = require('../controllers/relatorioController');

// Middleware de autenticação
const verificarAutenticacao = (req, res, next) => {
  if (!req.cookies.usuarioLogado) {
    return res.redirect('/login');
  }
  next();
};

// Página inicial de relatórios
router.get('/', verificarAutenticacao, async (req, res) => {
  await RelatorioController.renderRelatorios(req, res);
});

// Gerar relatórios
router.get('/gerar/estoque', verificarAutenticacao, async (req, res) => {
  await RelatorioController.getProdutosBaixoEstoque(req, res);
});

router.get('/gerar/vendas', verificarAutenticacao, async (req, res) => {
  await RelatorioController.getVendasPeriodo(req, res);
});

router.get('/gerar/produtos', verificarAutenticacao, async (req, res) => {
  await RelatorioController.getProdutosMaisVendidos(req, res);
});

router.get('/gerar/servicos', verificarAutenticacao, async (req, res) => {
  await RelatorioController.getServicosCadastrados(req, res);
});

router.get('/gerar/agendamentos', verificarAutenticacao, async (req, res) => {
  await RelatorioController.getAgendamentosPeriodo(req, res);
});

// Exportar relatório como CSV
router.get('/exportar', verificarAutenticacao, async (req, res) => {
  await RelatorioController.exportarCSV(req, res);
});

module.exports = router;
