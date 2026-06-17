const MarcaModel = require("../models/marcaModel");

class MarcaController {

    async listarView(req, res) {
        let marca = new MarcaModel();
        let lista = await marca.listarMarcas();
        res.render('marca/listar', {lista: lista});
    }

    cadastroView(req, res) {
        res.render('marca/cadastro', { msg: null });
    }

    async cadastrar(req, res) {
        const nome = req.body.nome;

        if (!nome || nome.trim() === '') {
            return res.render('marca/cadastro', { msg: 'Informe o nome da marca.' });
        }

        let marca = new MarcaModel(0, nome.trim());
        const ok = await marca.gravar();

        if (ok) {
            return res.redirect('/marcas');
        }

        res.render('marca/cadastro', { msg: 'Erro ao cadastrar marca.' });
    }
}

module.exports = MarcaController;
