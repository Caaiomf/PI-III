const PerfilModel = require("../models/perfilModel");
const UsuarioModel = require("../models/usuarioModel");
const ClienteModel = require("../models/clienteModel");
const { validarCpf, validarDataNascimento } = require("../utils/validacoes");

class UsuarioController{


    async listagemView(req, resp){
        const filtros = {
            q: req.query.q,
            status: req.query.status || 'all',
            perfil: req.query.perfil || '0',
            order: req.query.order || 'usu_id'
        };
        let usuario = new UsuarioModel();
        let listaUsuarios = await usuario.listar(filtros)
        let perfil = new PerfilModel();
        let listaPerfil = await perfil.listar();
        const grupos = {
            funcionarios: listaUsuarios.filter(u => String(u.perfilDescricao || '').toLowerCase().includes('funcion')),
            clientes: listaUsuarios.filter(u => String(u.perfilDescricao || '').toLowerCase().includes('cliente')),
            profissionais: listaUsuarios.filter(u => String(u.perfilDescricao || '').toLowerCase().includes('profissional')),
            outros: listaUsuarios.filter(u => {
                const p = String(u.perfilDescricao || '').toLowerCase();
                return !p.includes('funcion') && !p.includes('cliente') && !p.includes('profissional');
            })
        };
        resp.render("usuarios/listagem", { lista: listaUsuarios, listaPerfil: listaPerfil, filtros, grupos });
    }

    async cadastroView(req, resp){
        let perfil = new PerfilModel(); 
        let listaPerfil = await perfil.listar();
        resp.render("usuarios/cadastro", {listaPerfil: listaPerfil});
    }

    async cadastrar(req, resp){
        let msg = "";
        let cor = "";
        if(req.body.email != "" && req.body.senha != "" && req.body.nome != "" &&
        req.body.perfil != '0') {
            let usuarioConsulta = new UsuarioModel();
            let usuarioExistente = await usuarioConsulta.obterPorEmail(req.body.email);

            if(usuarioExistente != null) {
                return resp.send({
                    ok: false,
                    msg: "Este e-mail já está cadastrado!"
                });
            }

            const perfilSelecionado = await obterDescricaoPerfil(req.body.perfil);
            if(perfilSelecionado.includes('cliente')) {
                if(req.body.cpf && !validarCpf(req.body.cpf)) {
                    return resp.send({ ok: false, msg: "CPF inválido!" });
                }

                if(!validarDataNascimento(req.body.dataNascimento)) {
                    return resp.send({ ok: false, msg: "Data de nascimento inválida ou maior que a data de hoje!" });
                }
            }

            let usuario = new UsuarioModel(0, req.body.nome, req.body.email, req.body.senha, req.body.ativo, req.body.perfil);

            let result = await usuario.cadastrar();

            if(result) {
                const usuarioCriado = await usuarioConsulta.obterPorEmail(req.body.email);
                if(usuarioCriado && perfilSelecionado.includes('cliente')) {
                    await new ClienteModel().garantirPorUsuario(usuarioCriado.usuarioId, req.body);
                }
                resp.send({
                    ok: true,
                    msg: "Usuário cadastrado com sucesso!"
                });
            }   
            else{
                resp.send({
                    ok: false,
                    msg: "Erro ao cadastrar usuário!"
                });
            }
        }
        else
        {
            resp.send({
                ok: false,
                msg: "Parâmetros preenchidos incorretamente!"
            });
        }

    }

    async alterarView(req, res) {
        let perfil = new PerfilModel(); 
        let listaPerfil = await perfil.listar();
        let usuario = new UsuarioModel();
        usuario = await usuario.obter(req.params.id);
        res.render('usuarios/alterar', { usuario: usuario, listaPerfil: listaPerfil });
    }

    async excluir(req, res) {
        if(req.body.id != null) {
            let usuario = new UsuarioModel();
            const possuiHistorico = await usuario.possuiHistorico(req.body.id);
            if(possuiHistorico) {
                return res.send({ok: false, msg: "Este usuário já possui venda ou agendamento e não pode ser excluído."});
            }
            let ok = await usuario.excluir(req.body.id);
            if(ok) {
                res.send({ok: true});
            }
            else{
                res.send({ok: false, msg: "Erro ao excluir usuário"})
            }
        }
        else{
            res.send({ok: false, msg: "O id para exclusão não foi enviado"})
        }
    }

    async alterar(req, res) {
        let msg = "";
        let cor = "";
        if(req.body.id > 0 && req.body.email != "" && req.body.senha != "" && req.body.nome != "" &&
        req.body.perfil != '0') {
            let usuarioConsulta = new UsuarioModel();
            let usuarioExistente = await usuarioConsulta.obterPorEmail(req.body.email);

            if(usuarioExistente != null && String(usuarioExistente.usuarioId) !== String(req.body.id)) {
                return res.send({
                    ok: false,
                    msg: "Este e-mail já está cadastrado!"
                });
            }

            const perfilSelecionado = await obterDescricaoPerfil(req.body.perfil);
            if(perfilSelecionado.includes('cliente')) {
                if(req.body.cpf && !validarCpf(req.body.cpf)) {
                    return res.send({ ok: false, msg: "CPF inválido!" });
                }

                if(!validarDataNascimento(req.body.dataNascimento)) {
                    return res.send({ ok: false, msg: "Data de nascimento inválida ou maior que a data de hoje!" });
                }
            }

            let usuario = new UsuarioModel(req.body.id, req.body.nome, req.body.email, req.body.senha, req.body.ativo, req.body.perfil);

            let result = await usuario.cadastrar();

            if(result) {
                if(perfilSelecionado.includes('cliente')) {
                    await new ClienteModel().garantirPorUsuario(req.body.id, req.body);
                }
                res.send({
                    ok: true,
                    msg: "Usuário alterado com sucesso!"
                });
            }   
            else{
                res.send({
                    ok: false,
                    msg: "Erro ao alterar usuário!"
                });
            }
        }
        else
        {
            res.send({
                ok: false,
                msg: "Parâmetros preenchidos incorretamente!"
            });
        }
    }
}

async function obterDescricaoPerfil(perfilId) {
    const perfilModel = new PerfilModel();
    const perfis = await perfilModel.listar();
    const perfil = perfis.find(p => String(p.perfilId) === String(perfilId));
    return String(perfil ? perfil.perfilDescricao : '').toLowerCase();
}

module.exports = UsuarioController;
