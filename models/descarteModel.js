const Database = require('../db/database');
const { inteiroPositivo } = require('../utils/validacoes');

const banco = new Database();

class DescarteModel {
    async listarLotes() {
        const sql = `
            SELECT * FROM (
                SELECT
                    'COMPRA' AS origem,
                    c.com_id AS origem_id,
                    c.prd_id,
                    p.prd_nome,
                    COALESCE(NULLIF(c.com_lote, ''), CONCAT('COMPRA-', c.com_id)) AS lote,
                    c.com_quantidade AS quantidade,
                    c.com_validade AS validade
                FROM tb_compra c
                INNER JOIN tb_produto p ON p.prd_id = c.prd_id
                WHERE c.com_validade IS NOT NULL

                UNION ALL

                SELECT
                    'RECEBIMENTO' AS origem,
                    i.rit_id AS origem_id,
                    i.prd_id,
                    p.prd_nome,
                    CONCAT('REC-', i.rit_id) AS lote,
                    i.rit_quantidade AS quantidade,
                    i.rit_validade AS validade
                FROM tb_recebimentoitens i
                INNER JOIN tb_produto p ON p.prd_id = i.prd_id
                WHERE i.rit_validade IS NOT NULL
            ) lotes
            ORDER BY validade ASC, prd_nome ASC
        `;
        return await banco.ExecutaComando(sql, []);
    }

    async registrar(dados) {
        const quantidade = inteiroPositivo(dados.quantidade);
        if(quantidade === null) return false;

        const sql = `
            INSERT INTO tb_descarte
                (prd_id, fun_id, des_quantidade, des_motivo, des_data, des_observacao, des_empresa, des_data_vencimento)
            VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?)
        `;
        const valores = [
            dados.produtoId,
            dados.funcionarioId || null,
            quantidade,
            dados.motivo,
            dados.observacao || null,
            dados.empresa || null,
            dados.validade || null
        ];
        return await banco.ExecutaComandoNonQuery(sql, valores);
    }
}

module.exports = DescarteModel;
