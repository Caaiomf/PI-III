const Database = require('../db/database');

const conexao = new Database();

class MarcaModel {

    #marcaId;
    #marcaNome;

    get marcaId() { return this.#marcaId; } set marcaId(marcaId) {this.#marcaId = marcaId;}
    get marcaNome() { return this.#marcaNome; } set marcaNome(marcaNome) {this.#marcaNome = marcaNome;}

    constructor(marcaId, marcaNome) {
        this.#marcaId = marcaId
        this.#marcaNome = marcaNome
    }


    async listarMarcas() {

        let sql = 'select * from tb_marca';
        
        var rows = await conexao.ExecutaComando(sql);

        let listaRetorno = [];

        if(rows.length > 0){
            for(let i=0; i<rows.length; i++){
                var row = rows[i];
                listaRetorno.push(new MarcaModel
                    (row['mar_id'], row['mar_nome']));
            }
        }

        return listaRetorno;
    }

    async gravar() {
        let sql = 'insert into tb_marca (mar_nome) values (?)';
        let valores = [this.#marcaNome];

        return await conexao.ExecutaComandoNonQuery(sql, valores);
    }

}

module.exports = MarcaModel;
