const Database = require('../db/database');

const banco = new Database();

class ServicoTipoModel {

    #stp_id;
    #stp_nome;
    #stp_valor;
    #stp_ativo;
    #stp_criado_em;

    get id()         { return this.#stp_id; }       set id(v)         { this.#stp_id = v; }
    get nome()       { return this.#stp_nome; }     set nome(v)       { this.#stp_nome = v; }
    get valor()      { return this.#stp_valor; }    set valor(v)      { this.#stp_valor = v; }
    get ativo()      { return this.#stp_ativo; }    set ativo(v)      { this.#stp_ativo = v; }
    get criadoEm()   { return this.#stp_criado_em; } set criadoEm(v)  { this.#stp_criado_em = v; }

    constructor(id, nome, valor, ativo, criadoEm) {
        this.#stp_id       = id;
        this.#stp_nome     = nome;
        this.#stp_valor    = valor;
        this.#stp_ativo    = ativo;
        this.#stp_criado_em = criadoEm;
    }

    static fromRow(row) {
        return new ServicoTipoModel(
            row['stp_id'],
            row['stp_nome'],
            row['stp_valor'],
            row['stp_ativo'],
            row['stp_criado_em']
        );
    }

    async listar() {
        // aceitar filtros opcionais: { q, status, minValor, maxValor }
        const args = arguments[0] || {};
        const q = args.q;
        const status = args.status;
        const minValor = args.minValor;
        const maxValor = args.maxValor;

        let where = '';
        const valores = [];
        if (q && q.trim() !== '') {
            where += (where ? ' AND ' : ' WHERE ') + '(stp_nome LIKE ?)';
            valores.push('%' + q.trim() + '%');
        }
        if (status && status !== 'all') {
            where += (where ? ' AND ' : ' WHERE ') + 'stp_ativo = ?';
            valores.push(status === '1' ? 1 : 0);
        }
        if (minValor) {
            where += (where ? ' AND ' : ' WHERE ') + 'stp_valor >= ?';
            valores.push(minValor);
        }
        if (maxValor) {
            where += (where ? ' AND ' : ' WHERE ') + 'stp_valor <= ?';
            valores.push(maxValor);
        }

        const sql = 'SELECT * FROM tb_servico_tipo ' + where + ' ORDER BY stp_nome';
        const rows = await banco.ExecutaComando(sql, valores);
        return rows.map(r => ServicoTipoModel.fromRow(r));
    }

    async buscar(id) {
        const sql = 'SELECT * FROM tb_servico_tipo WHERE stp_id = ?';
        const rows = await banco.ExecutaComando(sql, [id]);
        if (rows.length === 0) return null;
        return ServicoTipoModel.fromRow(rows[0]);
    }

    async gravar() {
        if (!this.#stp_id) {
            // INSERT
            const sql = 'INSERT INTO tb_servico_tipo (stp_nome, stp_valor, stp_ativo) VALUES (?, ?, ?)';
            const id = await banco.ExecutaComandoLastInserted(sql, [
                this.#stp_nome,
                this.#stp_valor,
                this.#stp_ativo
            ]);
            this.#stp_id = id;
            return id > 0;
        } else {
            // UPDATE
            const sql = 'UPDATE tb_servico_tipo SET stp_nome = ?, stp_valor = ?, stp_ativo = ? WHERE stp_id = ?';
            return await banco.ExecutaComandoNonQuery(sql, [
                this.#stp_nome,
                this.#stp_valor,
                this.#stp_ativo,
                this.#stp_id
            ]);
        }
    }

    async excluir(id) {
        const sql = 'DELETE FROM tb_servico_tipo WHERE stp_id = ?';
        return await banco.ExecutaComandoNonQuery(sql, [id]);
    }

    async possuiHistorico(id) {
        const rows = await banco.ExecutaComando('SELECT COUNT(*) total FROM tb_agendamento WHERE stp_id = ?', [id]);
        return rows[0] && rows[0].total > 0;
    }
}

module.exports = ServicoTipoModel;
