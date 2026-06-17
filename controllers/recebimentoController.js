const RecebimentoModel = require('../models/recebimentoModel');

class RecebimentoController {
    async index(req, res) {
        res.render('recebimentos/index');
    }

    async listar(req, res) {
        try {
            const model = new RecebimentoModel();
            const lista = await model.listar({
                produto: req.query.produto,
                dataInicio: req.query.dataInicio,
                dataFim: req.query.dataFim
            });
            res.send(lista);
        } catch (erro) {
            res.status(500).send([]);
        }
    }

    async cadastrar(req, res) {
        const body = req.body;

        if (!body || !Array.isArray(body.itens) || body.itens.length === 0) {
            return res.send({ ok: false, msg: 'Informe pelo menos um item.' });
        }

        try {
            const model = new RecebimentoModel();
            const ok = await model.cadastrar(body);
            res.send({ ok, msg: ok ? 'Recebimento registrado.' : 'Erro ao registrar recebimento.' });
        } catch (erro) {
            res.send({ ok: false, msg: 'Erro ao registrar recebimento.' });
        }
    }
}

module.exports = RecebimentoController;
