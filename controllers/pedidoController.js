const PedidoItemModel = require("../models/pedidoItemModel");
const PedidoModel = require("../models/pedidoModel");
const ProdutoModel = require("../models/produtoModel");
const ClienteModel = require("../models/clienteModel");
const { inteiroPositivo } = require("../utils/validacoes");

class PedidoController {

    async pedidosView(req, res) {
        res.render("pedido/index");
    }

    async listarPedidos(req, res) {
        const filtros = {
            q: req.query.q || req.query.busca,
            dataInicio: req.query.dataInicio,
            dataFim: req.query.dataFim,
            minTotal: req.query.minTotal,
            maxTotal: req.query.maxTotal
        };
        let item = new PedidoItemModel();
        let lista = await item.listarPedidosItens(filtros);
        res.send(lista);
    }

    async gravar(req, res) {
        const clienteId = req.cookies && req.cookies.clienteLogado;

        if(!clienteId) {
            return res.send({ ok: false, precisaLogin: true, msg: "Entre como cliente para finalizar a compra." });
        }

        const cliente = await new ClienteModel().obter(clienteId);
        if(!cliente) {
            return res.send({ ok: false, precisaLogin: true, msg: "Sessão de cliente inválida. Entre novamente." });
        }

        const itens = Array.isArray(req.body) ? req.body : req.body.itens;
        const endereco = Array.isArray(req.body) ? '' : (req.body.endereco || '').trim();
        const cidade = Array.isArray(req.body) ? '' : (req.body.cidade || '').trim();
        const estado = Array.isArray(req.body) ? '' : (req.body.estado || '').trim();

        if(!endereco || !cidade || !estado) {
            return res.send({ ok: false, msg: "Informe endereço, cidade e estado para finalizar a compra." });
        }

        if(!Array.isArray(itens) || itens.length === 0) {
            return res.send({ ok: false, msg: "Nenhum produto enviado!" });
        }

        const produtoModel = new ProdutoModel();

        for(let i = 0; i < itens.length; i++) {
            const quantidade = inteiroPositivo(itens[i].quantidade);
            const produto = await produtoModel.buscarProduto(itens[i].id);

            if(!produto) {
                return res.send({ ok: false, msg: "Produto não encontrado." });
            }

            if(quantidade === null) {
                return res.send({ ok: false, msg: "Quantidade inválida no carrinho." });
            }

            if(parseInt(produto.produtoQuantidade) === 0) {
                return res.send({ ok: false, msg: `O produto ${produto.produtoNome} está sem estoque.` });
            }

            if(quantidade > parseInt(produto.produtoQuantidade)) {
                return res.send({ ok: false, msg: `O produto ${produto.produtoNome} possui apenas ${produto.produtoQuantidade} unidade(s) em estoque.` });
            }
        }

        let pedido = new PedidoModel();
        pedido.clienteId = clienteId;
        pedido.endereco = endereco;
        pedido.cidade = cidade;
        pedido.estado = estado;
        let pedidoId = await pedido.gravar();
        pedido.pedidoValorTotal = 0;

        if(!pedidoId) {
            return res.send({ ok: false, msg: "Erro ao gerar pedido." });
        }

        for(let i = 0; i < itens.length; i++) {
            const produto = await produtoModel.buscarProduto(itens[i].id);
            const quantidade = inteiroPositivo(itens[i].quantidade);

            const baixou = await produtoModel.baixarEstoque(produto.produtoId, quantidade);
            if(!baixou) {
                return res.send({ ok: false, msg: `Estoque insuficiente para ${produto.produtoNome}.` });
            }

            let item = new PedidoItemModel();
            item.pedidoId = pedidoId;
            item.produtoId = produto.produtoId;
            item.pedidoItemQuantidade = quantidade;
            item.pedidoItemValor = produto.produtoValor;
            item.pedidoItemValorTotal = item.pedidoItemQuantidade * item.pedidoItemValor;
            await item.gravar();
            pedido.pedidoValorTotal += item.pedidoItemValorTotal;
        }

        await pedido.atualizar();
        res.send({ ok: true, msg: "Pedido gerado com sucesso!" });
    }
}

module.exports = PedidoController;
