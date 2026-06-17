const Database = require('../db/database');

const banco = new Database();

class AgendamentoModel {
    async listar(filtros) {
        const args = filtros || {};
        let where = '';
        const valores = [];

        if(args.status && args.status !== 'all') {
            where += (where ? ' AND ' : ' WHERE ') + 'a.age_status = ?';
            valores.push(args.status);
        }
        if(args.dataInicio) {
            where += (where ? ' AND ' : ' WHERE ') + 'a.age_data >= ?';
            valores.push(args.dataInicio);
        }
        if(args.dataFim) {
            where += (where ? ' AND ' : ' WHERE ') + 'a.age_data <= ?';
            valores.push(args.dataFim);
        }
        if(args.q && args.q.trim() !== '') {
            where += (where ? ' AND ' : ' WHERE ') + '(s.stp_nome LIKE ? OR uc.usu_nome LIKE ? OR up.usu_nome LIKE ?)';
            valores.push('%' + args.q.trim() + '%', '%' + args.q.trim() + '%', '%' + args.q.trim() + '%');
        }

        const sql = `
            SELECT a.*, s.stp_nome, s.stp_valor, uc.usu_nome cliente, uc.usu_email cliente_email, up.usu_nome profissional
            FROM tb_agendamento a
            INNER JOIN tb_servico_tipo s ON s.stp_id = a.stp_id
            INNER JOIN tb_cliente c ON c.cli_id = a.cli_id
            INNER JOIN tb_usuario uc ON uc.usu_id = c.usu_id
            INNER JOIN tb_usuario up ON up.usu_id = a.pro_usu_id
            ${where}
            ORDER BY a.age_data DESC, a.age_hora DESC
        `;
        return await banco.ExecutaComando(sql, valores);
    }

    async obter(id) {
        const rows = await banco.ExecutaComando('SELECT * FROM tb_agendamento WHERE age_id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    async listarPorCliente(clienteId) {
        const sql = `
            SELECT a.*, s.stp_nome, s.stp_valor, u.usu_nome profissional
            FROM tb_agendamento a
            INNER JOIN tb_servico_tipo s ON s.stp_id = a.stp_id
            INNER JOIN tb_usuario u ON u.usu_id = a.pro_usu_id
            WHERE a.cli_id = ?
            ORDER BY a.age_data DESC, a.age_hora DESC
        `;
        return await banco.ExecutaComando(sql, [clienteId]);
    }

    async horarioOcupado(profissionalId, data, hora) {
        const rows = await banco.ExecutaComando(
            'SELECT COUNT(*) total FROM tb_agendamento WHERE pro_usu_id = ? AND age_data = ? AND age_hora = ?',
            [profissionalId, data, hora]
        );
        return rows[0] && rows[0].total > 0;
    }

    async horarioOcupadoExceto(profissionalId, data, hora, agendamentoId) {
        const rows = await banco.ExecutaComando(
            'SELECT COUNT(*) total FROM tb_agendamento WHERE pro_usu_id = ? AND age_data = ? AND age_hora = ? AND age_id <> ?',
            [profissionalId, data, hora, agendamentoId]
        );
        return rows[0] && rows[0].total > 0;
    }

    async cadastrar(dados) {
        const sql = `
            INSERT INTO tb_agendamento (cli_id, stp_id, pro_usu_id, age_data, age_hora, age_status, age_observacao)
            VALUES (?, ?, ?, ?, ?, 'PENDENTE', ?)
        `;
        return await banco.ExecutaComandoNonQuery(sql, [
            dados.clienteId,
            dados.servicoId,
            dados.profissionalId,
            dados.data,
            dados.hora,
            dados.observacao || null
        ]);
    }

    async atualizarStatus(id, status) {
        return await banco.ExecutaComandoNonQuery(
            'UPDATE tb_agendamento SET age_status = ? WHERE age_id = ?',
            [status, id]
        );
    }

    async reagendar(id, data, hora, observacao) {
        const atual = await this.obter(id);
        if(!atual) return false;

        return await banco.ExecutaComandoNonQuery(
            `UPDATE tb_agendamento
             SET age_data_anterior = age_data,
                 age_hora_anterior = age_hora,
                 age_data = ?,
                 age_hora = ?,
                 age_status = 'REAGENDADO',
                 age_observacao = ?,
                 age_reagendado_em = NOW()
             WHERE age_id = ?`,
            [data, hora, observacao || atual.age_observacao || null, id]
        );
    }
}

module.exports = AgendamentoModel;
