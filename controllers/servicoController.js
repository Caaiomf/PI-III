const ServicoTipoModel = require('../models/servicoTipoModel');

class ServicoController {

    // GET /servicos
    async listarView(req, res) {
        const m = new ServicoTipoModel();
        const filtros = {
            q: req.query.q,
            status: req.query.status || 'all',
            minValor: req.query.minValor,
            maxValor: req.query.maxValor
        };
        const lista = await m.listar(filtros);
        res.render('servicos/index', { lista, filtros });
    }

    // GET /servicos/cadastro
    cadastroView(req, res) {
        res.render('servicos/cadastro');
    }

    // POST /servicos/cadastro
    async cadastrar(req, res) {
        const { nome, valor, ativo } = req.body;
        if (!nome || !valor) {
            return res.send({ ok: false, msg: 'Preencha nome e valor.' });
        }
        const m = new ServicoTipoModel(null, nome, parseFloat(valor), ativo === '1' ? 1 : 0, null);
        const ok = await m.gravar();
        res.send({ ok, msg: ok ? 'Serviço cadastrado com sucesso!' : 'Erro ao cadastrar.' });
    }

    // GET /servicos/alterar/:id
    async alterarView(req, res) {
        const m = new ServicoTipoModel();
        const servico = await m.buscar(req.params.id);
        if (!servico) return res.redirect('/servicos');
        res.render('servicos/alterar', { servico });
    }

    // POST /servicos/alterar
    async alterar(req, res) {
        const { id, nome, valor, ativo } = req.body;
        if (!id || !nome || !valor) {
            return res.send({ ok: false, msg: 'Dados inválidos.' });
        }
        const m = new ServicoTipoModel(id, nome, parseFloat(valor), ativo === '1' ? 1 : 0, null);
        const ok = await m.gravar();
        res.send({ ok, msg: ok ? 'Serviço atualizado com sucesso!' : 'Erro ao atualizar.' });
    }

    // POST /servicos/excluir
    async excluir(req, res) {
        const { id } = req.body;
        if (!id) return res.send({ ok: false, msg: 'ID não informado.' });
        const m = new ServicoTipoModel();
        const possuiHistorico = await m.possuiHistorico(id);
        if(possuiHistorico) {
            return res.send({ ok: false, msg: 'Este serviço já possui agendamento e não pode ser excluído.' });
        }
        const ok = await m.excluir(id);
        res.send({ ok, msg: ok ? 'Serviço excluído.' : 'Erro ao excluir.' });
    }
}

module.exports = ServicoController;
