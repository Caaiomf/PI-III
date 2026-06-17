const CompraModel = require('../models/compraModel');
const ProdutoModel = require('../models/produtoModel');
const FornecedorModel = require('../models/fornecedorModel');

class CompraController {
    async index(req, res) {
        const produtoModel = new ProdutoModel();
        const produtos = await produtoModel.listarProdutos();
        const fornecedores = await new FornecedorModel().listar();
        res.render('compras/index', { produtos, fornecedores });
    }

    // GET /compras/listar
    async listar(req, res) {
        const filtros = {
            fornecedor: req.query.fornecedor,
            dataInicio: req.query.dataInicio,
            dataFim: req.query.dataFim,
            status: req.query.status
        };
        const m = new CompraModel();
        // aceitar paginação
        filtros.page = req.query.page;
        filtros.limit = req.query.limit;
        const resultado = await m.listar(filtros);
        // retornar { rows, total }
        res.send(resultado);
    }

    // POST /compras/cadastrar
    async cadastrar(req, res) {
        const body = req.body;
        if(!body || !body.fornecedor || !Array.isArray(body.items) || body.items.length === 0) {
            return res.send({ ok: false, msg: 'Dados incompletos.' });
        }

        for(const item of body.items) {
            if(!item.prd_id || !item.quantidade || !item.valor || !item.lote || !item.validade) {
                return res.send({ ok: false, msg: 'Informe produto, quantidade, valor, lote e validade em todos os itens.' });
            }
        }

        const m = new CompraModel();
        try {
            const ok = await m.gravar(body);
            res.send({ ok });
        } catch (e) {
            console.error('Erro cadastrar compra', e.message);
            res.send({ ok: false, msg: 'Erro ao cadastrar.' });
        }
    }

    // POST /compras/excluir
    async excluir(req, res) {
        const id = req.body.id;
        if(!id) return res.send({ ok: false, msg: 'ID não informado.' });
        const m = new CompraModel();
        try {
            const ok = await m.excluir(id);
            res.send({ ok });
        } catch (e) {
            console.error('Erro excluir compra', e.message);
            res.send({ ok: false, msg: 'Erro ao excluir.' });
        }
    }

    // GET /compras/obter/:id
    async obter(req, res) {
        const id = req.params.id;
        if(!id) return res.sendStatus(400);
        const m = new CompraModel();
        try {
            const obj = await m.obter(id);
            res.send(obj);
        } catch (e) {
            console.error('Erro obter compra', e.message);
            res.send({});
        }
    }

    // POST /compras/atualizar
    async atualizar(req, res) {
        const body = req.body;
        if(!body || !body.id) return res.send({ ok: false, msg: 'ID não informado.' });
        const m = new CompraModel();
        try {
            const ok = await m.atualizar(body);
            res.send({ ok });
        } catch (e) {
            console.error('Erro atualizar compra', e.message);
            res.send({ ok: false, msg: 'Erro ao atualizar.' });
        }
    }

    async atualizarStatus(req, res) {
        const id = req.body.id;
        const status = req.body.status;

        if(!id || !status) {
            return res.send({ ok: false, msg: 'Informe a compra e o status.' });
        }

        try {
            const resultado = await new CompraModel().atualizarStatus(id, status);
            res.send(resultado);
        } catch (e) {
            console.error('Erro atualizar status da compra', e.message);
            res.send({ ok: false, msg: 'Erro ao atualizar status da compra.' });
        }
    }
}

module.exports = CompraController;
