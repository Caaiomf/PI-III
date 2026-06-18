const CategoriaModel = require("../models/categoriaModel");
const MarcaModel = require("../models/marcaModel");
const ProdutoModel = require("../models/produtoModel");
const fs = require("fs");
const { inteiroPositivo, inteiroNaoNegativo, dinheiroNaoNegativo } = require("../utils/validacoes");

class ProdutoController {

    async listarView(req, res) {
        let prod = new ProdutoModel();
        const filtros = {
            q: req.query.q,
            categoria: req.query.categoria,
            marca: req.query.marca,
            minValor: req.query.minValor,
            maxValor: req.query.maxValor
        };
        let lista = await prod.listarProdutos(filtros);
        // carregar listas para selects
        const CategoriaModel = require('../models/categoriaModel');
        const MarcaModel = require('../models/marcaModel');
        const catModel = new CategoriaModel();
        const marModel = new MarcaModel();
        const listaCategorias = await catModel.listarCategorias();
        const listaMarcas = await marModel.listarMarcas();
        res.render('produto/listar', {lista: lista, filtros: filtros, listaCategorias, listaMarcas});
    }

    async excluirProduto(req, res){
        var ok = true;
        if(req.body.codigo != "") {
            let produto = new ProdutoModel();
            const possuiHistorico = await produto.possuiHistorico(req.body.codigo);
            if(possuiHistorico) {
                return res.send({ ok: false, msg: "Este produto já possui venda, compra, recebimento ou descarte e não pode ser excluído." });
            }
            ok = await produto.excluir(req.body.codigo);
        }
        else{
            ok = false;
        }

        res.send({ok: ok});
    }
    async cadastrarProduto(req, res){
        var ok = true;
        if(req.body.codigo != "" && req.body.nome != "" && 
        req.body.quantidade != "" && req.body.quantidade  != '0' && 
        req.body.marca != '0' && req.body.categoria  != '0' && req.body.preco != "") {
            const quantidade = inteiroPositivo(req.body.quantidade);
            const preco = dinheiroNaoNegativo(req.body.preco);
            if(quantidade === null || preco === null) {
                return res.send({ ok: false, msg: "Quantidade deve ser maior que zero e preço não pode ser negativo." });
            }

            const imagem = req.file != null ? req.file.filename : 'produto-sem-imagem.webp';
            let produto = new ProdutoModel(0, req.body.codigo,
                req.body.nome, quantidade,
                req.body.categoria, req.body.marca, "", "", imagem, preco);

            ok = await produto.gravar();
        }
        else{
            ok = false;
        }

        res.send({ ok: ok })
    }

    async alterarView(req, res){
        let produto = new ProdutoModel();
        let marca = new MarcaModel();
        
        let categoria = new CategoriaModel();
        if(req.params.id != undefined && req.params.id != ""){
            produto = await produto.buscarProduto(req.params.id);
        }

        let listaMarca = await marca.listarMarcas();
        let listaCategoria = await categoria.listarCategorias();
        res.render("produto/alterar", {produtoAlter: produto, listaMarcas: listaMarca, listaCategorias: listaCategoria});
    }

    async alterarProduto(req, res) {
        var ok = true;
        if(req.body.codigo != "" && req.body.nome != "" && req.body.quantidade != "" && req.body.marca != '0' && req.body.categoria  != '0') {
            const quantidade = inteiroNaoNegativo(req.body.quantidade);
            const preco = dinheiroNaoNegativo(req.body.preco);
            if(quantidade === null || preco === null) {
                return res.send({ ok: false, msg: "Quantidade e preço não podem ser negativos." });
            }

            let produto = new ProdutoModel(req.body.id, req.body.codigo, req.body.nome, quantidade, req.body.categoria, req.body.marca, "", "", "", preco);
            let produtoOld = await produto.buscarProduto(req.body.id);
            if(req.file != null) {
                //veio imagem, deletar a antiga;
                let nomeImg = produtoOld.produtoImagem.split("/").pop();
                if(fs.existsSync(global.CAMINHO_IMG_ABS + nomeImg)) {
                    fs.unlinkSync(global.CAMINHO_IMG_ABS + nomeImg)
                }
                // o produto que será alterado recebe a nova referência
                produto.produtoImagem = req.file.filename;
            }
            else {
                //não veio imagem, manter a mesma;
                produto.produtoImagem = produtoOld.produtoImagem.split("/").pop();
            }


            ok = await produto.gravar();
        }
        else{
            ok = false;
        }

        res.send({ ok: ok })
    }

    async cadastroView(req, res) {

        let listaMarcas = [];
        let listaCategorias = [];

        let marca = new MarcaModel();
        listaMarcas = await marca.listarMarcas();

        let categoria = new CategoriaModel();
        listaCategorias = await categoria.listarCategorias();

        res.render('produto/cadastro', { listaMarcas: listaMarcas, listaCategorias: listaCategorias });
    }

    async obterProduto(req, res) {
        //recebe o id do produto através da rota;
        let produtoId = req.params.produto;

        let produto = new ProdutoModel();
        produto = await produto.buscarProduto(produtoId);

        res.send({produto: produto})
    }
}

module.exports = ProdutoController;
