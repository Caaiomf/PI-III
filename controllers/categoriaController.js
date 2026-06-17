const CategoriaModel = require("../models/categoriaModel");

class CategoriaController {

    async listarView(req, res) {
        let cat = new CategoriaModel
        let lista = await cat.listarCategorias();
        res.render('categoria/listar', {lista: lista});
    }

    cadastroView(req, res) {
        res.render('categoria/cadastro', { msg: null });
    }

    async cadastrar(req, res) {
        const nome = req.body.nome;

        if (!nome || nome.trim() === '') {
            return res.render('categoria/cadastro', { msg: 'Informe o nome da categoria.' });
        }

        let cat = new CategoriaModel(0, nome.trim());
        const ok = await cat.gravar();

        if (ok) {
            return res.redirect('/categorias');
        }

        res.render('categoria/cadastro', { msg: 'Erro ao cadastrar categoria.' });
    }
}

module.exports = CategoriaController;
