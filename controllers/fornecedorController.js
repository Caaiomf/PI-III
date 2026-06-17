const FornecedorModel = require('../models/fornecedorModel');

class FornecedorController {
    async index(req, res) {
        const fornecedores = await new FornecedorModel().listar();
        res.render('fornecedores/index', { fornecedores, mensagem: req.query.ok ? 'Fornecedor cadastrado com sucesso.' : '' });
    }

    async cadastrar(req, res) {
        const nome = (req.body.nome || '').trim();
        const cnpj = (req.body.cnpj || '').trim();
        const telefone = (req.body.telefone || '').trim();
        const email = (req.body.email || '').trim();

        if(!nome) {
            const fornecedores = await new FornecedorModel().listar();
            return res.render('fornecedores/index', { fornecedores, mensagem: 'Informe o nome do fornecedor.' });
        }

        await new FornecedorModel().cadastrar({ nome, cnpj, telefone, email });
        res.redirect('/fornecedores?ok=1');
    }
}

module.exports = FornecedorController;
