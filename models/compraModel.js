const Database = require('../db/database');

const banco = new Database();

class CompraModel {
    // listar compras com filtros: { fornecedor, dataInicio, dataFim, status }
    async listar() {
        const args = arguments[0] || {};
        const fornecedor = args.fornecedor;
        const dataInicio = args.dataInicio;
        const dataFim = args.dataFim;
        const status = args.status;

        let where = '';
        const vals = [];
        if (fornecedor && fornecedor.trim() !== '') {
            where += (where ? ' AND ' : ' WHERE ') + 'com_fornecedor LIKE ?';
            vals.push('%' + fornecedor.trim() + '%');
        }
        if (dataInicio) {
            where += (where ? ' AND ' : ' WHERE ') + 'com_data >= ?';
            vals.push(dataInicio);
        }
        if (dataFim) {
            where += (where ? ' AND ' : ' WHERE ') + 'com_data <= ?';
            vals.push(dataFim);
        }
        if (status && status !== 'all') {
            where += (where ? ' AND ' : ' WHERE ') + 'com_status = ?';
            vals.push(status);
        }

        const page = args.page ? parseInt(args.page) : 1;
        const limit = args.limit ? parseInt(args.limit) : 10;
        const offset = (page - 1) * limit;

        const sql = 'SELECT * FROM tb_compra ' + where + ' ORDER BY com_data DESC, com_id DESC LIMIT ? OFFSET ?';
        try {
            const rows = await banco.ExecutaComando(sql, vals.concat([limit, offset]));
            // total
            const countSql = 'SELECT COUNT(*) as total FROM tb_compra ' + where;
            const cnt = await banco.ExecutaComando(countSql, vals);
            const total = (cnt && cnt[0] && cnt[0].total) ? cnt[0].total : 0;
            return { rows, total };
        } catch (e) {
            console.error('Erro ao listar compras:', e.message);
            return { rows: [], total: 0 };
        }
    }

    async gravar(compra) {
        // compra: { fornecedor, data, status, items: [ { prd_id, quantidade, valor, lote, validade } ] }
        const conn = banco;
        const data = compra.data || new Date().toISOString().slice(0,10);
        const fornecedor = compra.fornecedor;
        const status = compra.status || 'recebido';
        for(const it of compra.items) {
            const prd = it.prd_id || null;
            const q = it.quantidade || 0;
            const v = it.valor || 0;
            const lote = it.lote || null;
            const validade = it.validade || null;
            await conn.ExecutaComandoNonQuery(
                'INSERT INTO tb_compra (com_fornecedor, prd_id, com_quantidade, com_valorunitario, com_lote, com_validade, com_status, com_data, com_datarecebimento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [fornecedor, prd, q, v, lote, validade, status, data, status === 'recebido' ? new Date() : null]
            );
            if(status === 'recebido') {
                await conn.ExecutaComandoNonQuery(
                    'UPDATE tb_produto SET prd_quantidade = prd_quantidade + ? WHERE prd_id = ?',
                    [q, prd]
                );
            }
        }

        return true;
    }

    async excluir(id) {
        // excluir itens e compra
        try {
            const ok = await banco.ExecutaComandoNonQuery('DELETE FROM tb_compra WHERE com_id = ?', [id]);
            return ok;
        } catch (e) {
            console.error('Erro ao excluir compra', e.message);
            return false;
        }
    }

    async obter(id) {
        const rows = await banco.ExecutaComando('SELECT * FROM tb_compra WHERE com_id = ?', [id]);
        if(rows.length === 0) return null;
        return rows[0];
    }

    async atualizar(compra) {
        // atualizar campos e substituir itens simplificadamente
        const id = compra.id;
        if(!id) throw new Error('ID ausente');
        const fornecedor = compra.fornecedor;
        const data = compra.data;
        const status = compra.status;
        await banco.ExecutaComandoNonQuery(
            'UPDATE tb_compra SET com_fornecedor = ?, com_quantidade = ?, com_valorunitario = ?, com_lote = ?, com_validade = ?, com_status = ?, com_datarecebimento = ? WHERE com_id = ?',
            [
                fornecedor,
                compra.items && compra.items[0] ? compra.items[0].quantidade : null,
                compra.items && compra.items[0] ? compra.items[0].valor : null,
                compra.items && compra.items[0] ? compra.items[0].lote : null,
                compra.items && compra.items[0] ? compra.items[0].validade : null,
                status,
                compra.datarecebimento || null,
                id
            ]
        );
        return true;
    }

    async atualizarStatus(id, status) {
        const compra = await this.obter(id);
        if(!compra) {
            return { ok: false, msg: 'Compra não encontrada.' };
        }

        const statusAnterior = compra.com_status;
        const novoStatus = String(status || '').toLowerCase();
        if(!['pendente', 'recebido'].includes(novoStatus)) {
            return { ok: false, msg: 'Status inválido.' };
        }

        const recebeuAgora = statusAnterior !== 'recebido' && novoStatus === 'recebido';
        const dataRecebimento = novoStatus === 'recebido' ? new Date() : null;

        await banco.ExecutaComandoNonQuery(
            'UPDATE tb_compra SET com_status = ?, com_datarecebimento = ? WHERE com_id = ?',
            [novoStatus, dataRecebimento, id]
        );

        if(recebeuAgora) {
            await banco.ExecutaComandoNonQuery(
                'UPDATE tb_produto SET prd_quantidade = prd_quantidade + ? WHERE prd_id = ?',
                [compra.com_quantidade, compra.prd_id]
            );
        }

        return {
            ok: true,
            msg: recebeuAgora ? 'Compra recebida e estoque atualizado.' : 'Status atualizado.',
            estoqueAtualizado: recebeuAgora
        };
    }
}

module.exports = CompraModel;
