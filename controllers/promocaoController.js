const DescarteModel = require('../models/descarteModel');
const ProdutoModel = require('../models/produtoModel');

class PromocaoController {
    async index(req, res) {
        const lotes = await new DescarteModel().listarLotes();
        const hoje = new Date();
        const proximos = lotes.filter(function(lote) {
            if(!lote.validade) return false;
            const validade = new Date(lote.validade);
            const dias = Math.ceil((validade.getTime() - hoje.getTime()) / 86400000);
            return dias >= 0 && dias <= 60;
        });

        res.render('promocoes/index', {
            lotes: proximos,
            mensagem: req.query.msg || ''
        });
    }

    async definir(req, res) {
        const produtoId = req.body.produtoId;
        const valorPromocional = parseFloat(req.body.valorPromocional);
        const descricao = (req.body.descricao || 'Promoção por validade próxima').trim();

        if(!produtoId || !valorPromocional || valorPromocional <= 0) {
            return res.redirect('/promocoes?msg=' + encodeURIComponent('Informe um valor promocional válido.'));
        }

        await new ProdutoModel().definirPromocao(produtoId, valorPromocional, descricao);
        res.redirect('/promocoes?msg=' + encodeURIComponent('Promoção definida com sucesso.'));
    }

    async remover(req, res) {
        const produtoId = req.body.produtoId;

        if(!produtoId) {
            return res.redirect('/promocoes?msg=' + encodeURIComponent('Produto não informado.'));
        }

        await new ProdutoModel().removerPromocao(produtoId);
        res.redirect('/promocoes?msg=' + encodeURIComponent('Promoção removida com sucesso.'));
    }
}

module.exports = PromocaoController;
