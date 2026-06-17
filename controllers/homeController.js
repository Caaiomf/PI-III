const ProdutoModel = require("../models/produtoModel");

class HomeController {

    constructor() {

    }

    async adminHomeView(req, res) {
        res.render("home/admin");
    }

    async homeView(req, res) {
        let produto = new ProdutoModel();
        let listaProdutos = await produto.listarProdutos();
        res.render('home/index', {layout: false, produtos: listaProdutos, clienteLogado: req.cookies && req.cookies.clienteLogado});
    }
}


module.exports = HomeController;
