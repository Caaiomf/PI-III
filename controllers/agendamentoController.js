const AgendamentoModel = require('../models/agendamentoModel');
const ServicoTipoModel = require('../models/servicoTipoModel');
const UsuarioModel = require('../models/usuarioModel');

class AgendamentoController {
    async index(req, res) {
        const clienteId = req.cookies && req.cookies.clienteLogado;
        if(!clienteId) return res.redirect('/login');

        const servicos = await new ServicoTipoModel().listar({ status: '1' });
        const profissionais = await new UsuarioModel().listarProfissionais();
        const agendamentos = await new AgendamentoModel().listarPorCliente(clienteId);

        res.render('agendamentos/index', {
            layout: false,
            servicos,
            profissionais,
            agendamentos,
            mensagem: req.query.msg || ''
        });
    }

    async cadastrar(req, res) {
        const clienteId = req.cookies && req.cookies.clienteLogado;
        if(!clienteId) {
            return res.send({ ok: false, precisaLogin: true, msg: 'Entre como cliente para agendar.' });
        }

        const servicoId = req.body.servicoId;
        const profissionalId = req.body.profissionalId;
        const data = req.body.data;
        const hora = req.body.hora;
        const observacao = req.body.observacao || '';

        if(!servicoId || !profissionalId || !data || !hora) {
            return res.send({ ok: false, msg: 'Informe serviço, profissional, data e hora.' });
        }

        const validacao = validarDataHora(data, hora);
        if(!validacao.ok) {
            return res.send(validacao);
        }

        const model = new AgendamentoModel();
        const ocupado = await model.horarioOcupado(profissionalId, data, hora);
        if(ocupado) {
            return res.send({ ok: false, msg: 'Este profissional já possui agendamento nesse horário.' });
        }

        try {
            const ok = await model.cadastrar({ clienteId, servicoId, profissionalId, data, hora, observacao });
            res.send({ ok, msg: ok ? 'Agendamento solicitado com sucesso.' : 'Erro ao agendar.' });
        } catch (e) {
            if(e && e.code === 'ER_DUP_ENTRY') {
                return res.send({ ok: false, msg: 'Este profissional já possui agendamento nesse horário.' });
            }
            res.send({ ok: false, msg: 'Erro ao agendar.' });
        }
    }

    async adminIndex(req, res) {
        const filtros = {
            status: req.query.status || 'all',
            dataInicio: req.query.dataInicio,
            dataFim: req.query.dataFim,
            q: req.query.q
        };
        const agendamentos = await new AgendamentoModel().listar(filtros);
        res.render('agendamentos/admin', { agendamentos, filtros });
    }

    async adminAtualizarStatus(req, res) {
        const id = req.body.id;
        const status = req.body.status;
        const permitidos = ['PENDENTE', 'CONCLUIDO', 'CANCELADO'];

        if(!id || !permitidos.includes(status)) {
            return res.send({ ok: false, msg: 'Status inválido.' });
        }

        const ok = await new AgendamentoModel().atualizarStatus(id, status);
        res.send({ ok, msg: ok ? 'Status atualizado.' : 'Erro ao atualizar status.' });
    }

    async adminReagendar(req, res) {
        const id = req.body.id;
        const data = req.body.data;
        const hora = req.body.hora;
        const observacao = req.body.observacao || '';

        if(!id || !data || !hora) {
            return res.send({ ok: false, msg: 'Informe a nova data e hora.' });
        }

        const validacao = validarDataHora(data, hora);
        if(!validacao.ok) {
            return res.send(validacao);
        }

        const model = new AgendamentoModel();
        const agendamento = await model.obter(id);
        if(!agendamento) {
            return res.send({ ok: false, msg: 'Agendamento não encontrado.' });
        }

        const ocupado = await model.horarioOcupadoExceto(agendamento.pro_usu_id, data, hora, id);
        if(ocupado) {
            return res.send({ ok: false, msg: 'Este profissional já possui agendamento nesse horário.' });
        }

        try {
            const ok = await model.reagendar(id, data, hora, observacao);
            res.send({ ok, msg: ok ? 'Agendamento reagendado com sucesso.' : 'Erro ao reagendar.' });
        } catch (e) {
            if(e && e.code === 'ER_DUP_ENTRY') {
                return res.send({ ok: false, msg: 'Este profissional já possui agendamento nesse horário.' });
            }
            res.send({ ok: false, msg: 'Erro ao reagendar.' });
        }
    }
}

function validarDataHora(data, hora) {
    const diaEscolhido = new Date(data + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if(diaEscolhido.getTime() < hoje.getTime()) {
        return { ok: false, msg: 'Não é possível agendar em uma data anterior a hoje.' };
    }

    if(diaEscolhido.getDay() === 0) {
        return { ok: false, msg: 'Agendamentos são permitidos somente de segunda a sábado.' };
    }

    const partesHora = String(hora).split(':');
    const minutos = (parseInt(partesHora[0]) * 60) + parseInt(partesHora[1] || '0');
    if(minutos < 360 || minutos > 1140) {
        return { ok: false, msg: 'Escolha um horário entre 06:00 e 19:00.' };
    }

    const escolhido = new Date(data + 'T' + hora);
    if(escolhido.getTime() < new Date().getTime()) {
        return { ok: false, msg: 'Escolha uma data e hora futuras.' };
    }

    return { ok: true };
}

module.exports = AgendamentoController;
