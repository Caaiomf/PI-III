const Database = require('../db/database');

const banco = new Database();

class FornecedorModel {
    async listar() {
        const sql = 'SELECT * FROM tb_fornecedor ORDER BY for_nome';
        return await banco.ExecutaComando(sql, []);
    }

    async cadastrar(dados) {
        const sql = 'INSERT INTO tb_fornecedor (for_nome, for_cnpj, for_telefone, for_email) VALUES (?, ?, ?, ?)';
        const valores = [
            dados.nome,
            dados.cnpj || null,
            dados.telefone || null,
            dados.email || null
        ];
        return await banco.ExecutaComandoNonQuery(sql, valores);
    }
}

module.exports = FornecedorModel;
