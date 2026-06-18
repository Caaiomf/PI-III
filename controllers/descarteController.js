const DescarteModel = require('../models/descarteModel');
const DescarteEmpresaModel = require('../models/descarteEmpresaModel');
const { validarCnpj, inteiroPositivo } = require('../utils/validacoes');

class DescarteController {
    async index(req, res) {
        const descarteModel = new DescarteModel();
        const empresaModel = new DescarteEmpresaModel();
        const lotes = await descarteModel.listarLotes();
        const empresas = await empresaModel.listar();
        res.render('descartes/index', {
            lotes,
            empresas,
            mensagem: req.query.msg || ''
        });
    }

    async cadastrarEmpresa(req, res) {
        const nome = (req.body.nome || '').trim();
        const cnpj = (req.body.cnpj || '').trim();
        const telefone = (req.body.telefone || '').trim();
        const email = (req.body.email || '').trim();

        if(!nome) {
            return res.redirect('/descartes?msg=' + encodeURIComponent('Informe o nome da empresa de descarte.'));
        }

        if(cnpj && !validarCnpj(cnpj)) {
            return res.redirect('/descartes?msg=' + encodeURIComponent('CNPJ inválido.'));
        }

        await new DescarteEmpresaModel().cadastrar({ nome, cnpj, telefone, email });
        res.redirect('/descartes?msg=' + encodeURIComponent('Empresa de descarte cadastrada com sucesso.'));
    }

    async registrar(req, res) {
        const produtoId = req.body.produtoId;
        const quantidade = inteiroPositivo(req.body.quantidade);
        const motivo = req.body.motivo || 'VENCIDO';
        const empresa = req.body.empresa || '';
        const validade = req.body.validade || null;
        const observacao = req.body.observacao || '';
        const funcionarioId = 1;

        if(!produtoId || quantidade === null || !empresa || !validade) {
            return res.redirect('/descartes?msg=' + encodeURIComponent('Informe lote, empresa, quantidade e validade para registrar o descarte.'));
        }

        await new DescarteModel().registrar({ produtoId, quantidade, motivo, empresa, validade, observacao, funcionarioId });
        res.redirect('/descartes?msg=' + encodeURIComponent('Descarte registrado com sucesso.'));
    }
}

module.exports = DescarteController;
