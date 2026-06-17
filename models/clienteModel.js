const Database = require('../db/database');
const UsuarioModel = require('./usuarioModel');

const banco = new Database();

class ClienteModel {
    async obter(id) {
        const rows = await banco.ExecutaComando('SELECT * FROM tb_cliente WHERE cli_id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    async obterPorUsuario(usuarioId) {
        const rows = await banco.ExecutaComando('SELECT * FROM tb_cliente WHERE usu_id = ?', [usuarioId]);
        return rows.length > 0 ? rows[0] : null;
    }

    async garantirPorUsuario(usuarioId, dados) {
        const existente = await this.obterPorUsuario(usuarioId);
        if(existente) return true;

        return await banco.ExecutaComandoNonQuery(
            'INSERT INTO tb_cliente (usu_id, cli_cpf, cli_telefone, cli_data_nascimento) VALUES (?, ?, ?, ?)',
            [usuarioId, dados && dados.cpf ? dados.cpf : null, dados && dados.telefone ? dados.telefone : null, dados && dados.dataNascimento ? dados.dataNascimento : null]
        );
    }

    async login(email, senha) {
        const usuarioModel = new UsuarioModel();
        const usuario = await usuarioModel.obterPorEmailSenha(email, senha);

        if (!usuario || usuario.usuarioAtivo !== 'S') return null;
        if (String(usuario.usuarioEmail).toLowerCase().endsWith('@vitalis.com')) return null;

        const cliente = await this.obterPorUsuario(usuario.usuarioId);
        if (!cliente) return null;

        return { usuario, cliente };
    }

    async cadastrar(dados) {
        const usuarioModel = new UsuarioModel();
        const existente = await usuarioModel.obterPorEmail(dados.email);

        if (existente) {
            return { ok: false, msg: 'Este e-mail já está cadastrado.' };
        }

        const usuario = new UsuarioModel(0, dados.nome, dados.email, dados.senha, 'S', 1);
        const okUsuario = await usuario.cadastrar();

        if (!okUsuario) {
            return { ok: false, msg: 'Erro ao cadastrar usuário.' };
        }

        const usuarioCriado = await usuarioModel.obterPorEmail(dados.email);
        const okCliente = await banco.ExecutaComandoNonQuery(
            'INSERT INTO tb_cliente (usu_id, cli_cpf, cli_telefone, cli_data_nascimento) VALUES (?, ?, ?, ?)',
            [usuarioCriado.usuarioId, dados.cpf || null, dados.telefone || null, dados.dataNascimento || null]
        );

        return {
            ok: okCliente,
            msg: okCliente ? 'Cadastro realizado com sucesso.' : 'Erro ao cadastrar cliente.',
            usuario: usuarioCriado
        };
    }
}

module.exports = ClienteModel;
