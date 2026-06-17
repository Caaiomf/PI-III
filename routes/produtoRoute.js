const express = require('express');
const multer = require('multer');
const ProdutoController = require('../controllers/produtoController');
const AuthMiddleware = require('../middlewares/authMiddleware');

const produtoRouter = express.Router();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/img/produtos');
    },
    filename: function(req, file, cb) {
        let nomeArq = "PRD-" + Date.now();
        let ext = file.originalname.split(".").pop()
        cb(null, `${nomeArq}.${ext}`);
    }
})

const upload = multer({ storage: storage })

let ctrl = new ProdutoController()
let auth = new AuthMiddleware();
produtoRouter.get('/', auth.verificarUsuarioLogado, ctrl.listarView);
produtoRouter.get('/cadastro',auth.verificarUsuarioLogado, ctrl.cadastroView);
produtoRouter.post("/cadastro", auth.verificarUsuarioLogado,upload.single("imagem"), ctrl.cadastrarProduto);
produtoRouter.post("/excluir",auth.verificarUsuarioLogado, ctrl.excluirProduto);
produtoRouter.post("/alterar", auth.verificarUsuarioLogado,upload.single("imagem"), ctrl.alterarProduto);
produtoRouter.get("/alterar/:id",auth.verificarUsuarioLogado, ctrl.alterarView);
produtoRouter.get("/obter/:produto", ctrl.obterProduto);

module.exports = produtoRouter;