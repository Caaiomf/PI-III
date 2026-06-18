const Database = require('../db/database');
const { limparCnpjAlfanumerico } = require('../utils/validacoes');

const banco = new Database();

class DescarteEmpresaModel {
    async listar() {
        return await banco.ExecutaComando('SELECT * FROM tb_descarte_empresa ORDER BY dem_nome', []);
    }

    async cadastrar(dados) {
        const sql = 'INSERT INTO tb_descarte_empresa (dem_nome, dem_cnpj, dem_telefone, dem_email) VALUES (?, ?, ?, ?)';
        const valores = [
            dados.nome,
            dados.cnpj ? limparCnpjAlfanumerico(dados.cnpj) : null,
            dados.telefone || null,
            dados.email || null
        ];
        return await banco.ExecutaComandoNonQuery(sql, valores);
    }
}

module.exports = DescarteEmpresaModel;
