const UsuarioModel = require("../models/usuarioModel");
const ClienteModel = require("../models/clienteModel");
const { validarCpf, validarDataNascimento } = require("../utils/validacoes");

class LoginController {

    loginView(req, res) {
        res.clearCookie('usuarioLogado');
        res.clearCookie('clienteLogado');
        res.render('login/index', { layout: false, tipo: 'cliente' });
    }

    async loginFuncionario(req, res) {
        let msg = "";
        if (req.body.email && req.body.password) {
            if (!String(req.body.email).toLowerCase().endsWith('@vitalis.com')) {
                return res.render('login/index', { layout: false, tipo: 'funcionario', msg: 'Funcionários devem usar e-mail @vitalis.com.' });
            }

            let usuario = new UsuarioModel();
            usuario = await usuario.obterPorEmailSenha(req.body.email, req.body.password);
            if (usuario != null) {
                res.cookie("usuarioLogado", usuario.usuarioId);
                res.clearCookie("clienteLogado");
                res.redirect("/admin");
                return;
            } else {
                msg = "E-mail ou senha incorretos!";
            }
        } else {
            msg = "Preencha o e-mail e a senha!";
        }
        // Always render the login page with the error message
        res.render('login/index', { layout: false, tipo: 'funcionario', msg: msg });
    }

    async loginCliente(req, res) {
        let msg = "";
        if (req.body.email && req.body.password) {
            let clienteModel = new ClienteModel();
            let login = await clienteModel.login(req.body.email, req.body.password);

            if (login != null) {
                res.cookie("clienteLogado", login.cliente.cli_id);
                res.clearCookie("usuarioLogado");
                res.redirect("/");
                return;
            }

            msg = "E-mail ou senha de cliente incorretos!";
        } else {
            msg = "Preencha o e-mail e a senha!";
        }

        res.render('login/index', { layout: false, tipo: 'cliente', msg: msg });
    }

    async cadastrarCliente(req, res) {
        const { nome, email, senha, cpf, telefone, dataNascimento } = req.body;

        if (!nome || !email || !senha) {
            return res.render('login/index', { layout: false, tipo: 'cadastro', msg: 'Preencha nome, e-mail e senha.' });
        }

        if (cpf && !validarCpf(cpf)) {
            return res.render('login/index', { layout: false, tipo: 'cadastro', msg: 'CPF inválido.' });
        }

        if (!validarDataNascimento(dataNascimento)) {
            return res.render('login/index', { layout: false, tipo: 'cadastro', msg: 'Data de nascimento inválida ou maior que a data de hoje.' });
        }

        if (String(email).toLowerCase().endsWith('@vitalis.com')) {
            return res.render('login/index', { layout: false, tipo: 'cadastro', msg: 'Use um e-mail pessoal para cadastro de cliente.' });
        }

        let clienteModel = new ClienteModel();
        let result = await clienteModel.cadastrar({ nome, email, senha, cpf, telefone, dataNascimento });

        if (!result.ok) {
            return res.render('login/index', { layout: false, tipo: 'cadastro', msg: result.msg });
        }

        let cliente = await clienteModel.obterPorUsuario(result.usuario.usuarioId);
        res.cookie("clienteLogado", cliente.cli_id);
        res.clearCookie("usuarioLogado");
        res.redirect("/");
    }
}

module.exports = LoginController;
