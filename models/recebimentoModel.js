const Database = require('../db/database');

const banco = new Database();

class RecebimentoModel {
    async listar(filtros = {}) {
        let where = '';
        const valores = [];

        if (filtros.dataInicio) {
            where += (where ? ' AND ' : ' WHERE ') + 'r.rec_data >= ?';
            valores.push(filtros.dataInicio);
        }

        if (filtros.dataFim) {
            where += (where ? ' AND ' : ' WHERE ') + 'r.rec_data <= ?';
            valores.push(filtros.dataFim);
        }

        if (filtros.produto && filtros.produto.trim() !== '') {
            where += (where ? ' AND ' : ' WHERE ') + '(p.prd_nome LIKE ? OR p.prd_id = ?)';
            valores.push('%' + filtros.produto.trim() + '%', filtros.produto);
        }

        const sql = `
            SELECT r.rec_id, r.fun_id, r.rec_data, r.rec_observacao,
                   i.prd_id, i.rit_quantidade, i.rit_valorunidade, i.rit_validade,
                   p.prd_nome
              FROM tb_recebimento r
              INNER JOIN tb_recebimentoitens i ON r.rec_id = i.rec_id
              INNER JOIN tb_produto p ON i.prd_id = p.prd_id
              ${where}
             ORDER BY r.rec_data DESC, r.rec_id DESC
             LIMIT 50
        `;

        return await banco.ExecutaComando(sql, valores);
    }

    async cadastrar(dados) {
        const funId = dados.funId || 1;
        const data = dados.data || new Date().toISOString().slice(0, 10);
        const observacao = dados.observacao || '';
        const itens = Array.isArray(dados.itens) ? dados.itens : [];

        if (itens.length === 0) return false;

        const recId = await banco.ExecutaComandoLastInserted(
            'INSERT INTO tb_recebimento (fun_id, rec_data, rec_observacao) VALUES (?, ?, ?)',
            [funId, data, observacao]
        );

        for (const item of itens) {
            await banco.ExecutaComandoNonQuery(
                'INSERT INTO tb_recebimentoitens (rec_id, prd_id, rit_quantidade, rit_valorunidade, rit_validade) VALUES (?, ?, ?, ?, ?)',
                [recId, item.produtoId, item.quantidade, item.valor || 0, item.validade || null]
            );

            await banco.ExecutaComandoNonQuery(
                'UPDATE tb_produto SET prd_quantidade = prd_quantidade + ? WHERE prd_id = ?',
                [item.quantidade, item.produtoId]
            );
        }

        return true;
    }
}

module.exports = RecebimentoModel;
