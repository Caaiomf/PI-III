const express = require('express');
const CategoriaController = require('../controllers/categoriaController');

const categoriaRouter = express.Router();
const ctrl = new CategoriaController();

categoriaRouter.get('/', ctrl.listarView);
categoriaRouter.get('/cadastro', ctrl.cadastroView);
categoriaRouter.post('/cadastro', ctrl.cadastrar);

module.exports = categoriaRouter;
