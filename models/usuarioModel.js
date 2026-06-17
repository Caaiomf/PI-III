const Database = require("../db/database");

const banco = new Database();

class UsuarioModel {
    #usuarioId;
    #usuarioNome;
    #usuarioEmail;
    #usuarioSenha;
    #usuarioAtivo;
    #perfilId;
    #perfilDescricao;

    get usuarioId() { return this.#usuarioId; }
    set usuarioId(usuarioId) { this.#usuarioId = usuarioId; }

    get usuarioNome() { return this.#usuarioNome; }
    set usuarioNome(usuarioNome) { this.#usuarioNome = usuarioNome; }

    get usuarioEmail() { return this.#usuarioEmail; }
    set usuarioEmail(usuarioEmail) { this.#usuarioEmail = usuarioEmail; }

    get usuarioSenha() { return this.#usuarioSenha; }
    set usuarioSenha(usuarioSenha) { this.#usuarioSenha = usuarioSenha; }

    get usuarioAtivo() { return this.#usuarioAtivo; }
    set usuarioAtivo(usuarioAtivo) { this.#usuarioAtivo = usuarioAtivo; }

    get perfilId() { return this.#perfilId; }
    set perfilId(perfilId) { this.#perfilId = perfilId; }

    get perfilDescricao() { return this.#perfilDescricao; }
    set perfilDescricao(perfilDescricao) { this.#perfilDescricao = perfilDescricao; }

    constructor(usuarioId, usuarioNome, usuarioEmail, usuarioSenha, usuarioAtivo, perfilId, perfilDescricao) {
        this.#usuarioId = usuarioId;
        this.#usuarioNome = usuarioNome;
        this.#usuarioEmail = usuarioEmail;
        this.#usuarioSenha = usuarioSenha;
        this.#usuarioAtivo = usuarioAtivo;
        this.#perfilId = perfilId;
        this.#perfilDescricao = perfilDescricao;
    }

    fromRow(row) {
        return new UsuarioModel(
            row["usu_id"],
            row["usu_nome"],
            row["usu_email"],
            row["usu_senha"],
            row["usu_ativo"],
            row["per_id"],
            row["per_descricao"]
        );
    }

    async obterPorEmailSenha(email, senha) {
        const sql = `
            SELECT u.*, p.per_descricao
            FROM tb_usuario u
            LEFT JOIN tb_perfil p ON p.per_id = u.per_id
            WHERE u.usu_email = ? AND u.usu_senha = ?
        `;
        const rows = await banco.ExecutaComando(sql, [email, senha]);
        return rows.length > 0 ? this.fromRow(rows[0]) : null;
    }

    async obterPorEmail(email) {
        const sql = `
            SELECT u.*, p.per_descricao
            FROM tb_usuario u
            LEFT JOIN tb_perfil p ON p.per_id = u.per_id
            WHERE u.usu_email = ?
        `;
        const rows = await banco.ExecutaComando(sql, [email]);
        return rows.length > 0 ? this.fromRow(rows[0]) : null;
    }

    async listar() {
        const args = arguments[0] || {};
        const q = args.q;
        const status = args.status;
        const perfil = args.perfil;
        const order = args.order || 'usu_id';

        let where = '';
        const valores = [];

        if(q && q.trim() !== '') {
            where += (where ? ' AND ' : ' WHERE ') + '(u.usu_nome LIKE ? OR u.usu_email LIKE ?)';
            valores.push('%' + q.trim() + '%');
            valores.push('%' + q.trim() + '%');
        }
        if(status && status !== 'all') {
            where += (where ? ' AND ' : ' WHERE ') + 'u.usu_ativo = ?';
            valores.push(status === '1' || status === 'S' ? 'S' : 'N');
        }
        if(perfil && perfil !== '0') {
            where += (where ? ' AND ' : ' WHERE ') + 'u.per_id = ?';
            valores.push(perfil);
        }

        const orderMap = {
            usu_id: 'u.usu_id',
            usu_nome: 'u.usu_nome',
            usu_email: 'u.usu_email'
        };

        const sql = `
            SELECT u.*, p.per_descricao
            FROM tb_usuario u
            LEFT JOIN tb_perfil p ON p.per_id = u.per_id
            ${where}
            ORDER BY ${orderMap[order] || 'u.usu_id'}
        `;

        const rows = await banco.ExecutaComando(sql, valores);
        return rows.map(row => this.fromRow(row));
    }

    async cadastrar() {
        const ativo = this.#usuarioAtivo === true || this.#usuarioAtivo === 'true' || this.#usuarioAtivo === '1' || this.#usuarioAtivo === 'S' ? 'S' : 'N';

        if(this.#usuarioId == 0) {
            const sql = "insert into tb_usuario (usu_email, usu_nome, usu_senha, usu_ativo, per_id) values (?,?,?,?,?)";
            return await banco.ExecutaComandoNonQuery(sql, [this.#usuarioEmail, this.#usuarioNome, this.#usuarioSenha, ativo, this.#perfilId]);
        }

        const sql = "update tb_usuario set usu_email = ?, usu_nome = ?, usu_senha = ?, usu_ativo = ?, per_id = ? where usu_id = ?";
        return await banco.ExecutaComandoNonQuery(sql, [this.#usuarioEmail, this.#usuarioNome, this.#usuarioSenha, ativo, this.#perfilId, this.#usuarioId]);
    }

    async obter(id) {
        const sql = `
            SELECT u.*, p.per_descricao
            FROM tb_usuario u
            LEFT JOIN tb_perfil p ON p.per_id = u.per_id
            WHERE u.usu_id = ?
        `;
        const rows = await banco.ExecutaComando(sql, [id]);
        return rows.length > 0 ? this.fromRow(rows[0]) : null;
    }

    async excluir(id) {
        await banco.ExecutaComandoNonQuery("delete from tb_cliente where usu_id = ?", [id]);
        return await banco.ExecutaComandoNonQuery("delete from tb_usuario where usu_id = ?", [id]);
    }

    async possuiHistorico(id) {
        const clienteRows = await banco.ExecutaComando('SELECT cli_id FROM tb_cliente WHERE usu_id = ?', [id]);
        if(clienteRows.length > 0) {
            const clienteId = clienteRows[0].cli_id;
            const pedidos = await banco.ExecutaComando('SELECT COUNT(*) total FROM tb_pedido WHERE cli_id = ?', [clienteId]);
            if(pedidos[0] && pedidos[0].total > 0) return true;

            const agendamentosCliente = await banco.ExecutaComando('SELECT COUNT(*) total FROM tb_agendamento WHERE cli_id = ?', [clienteId]);
            if(agendamentosCliente[0] && agendamentosCliente[0].total > 0) return true;
        }

        const agendamentosProfissional = await banco.ExecutaComando('SELECT COUNT(*) total FROM tb_agendamento WHERE pro_usu_id = ?', [id]);
        return agendamentosProfissional[0] && agendamentosProfissional[0].total > 0;
    }

    async listarProfissionais() {
        const sql = `
            SELECT u.*, p.per_descricao
            FROM tb_usuario u
            INNER JOIN tb_perfil p ON p.per_id = u.per_id
            WHERE u.usu_ativo = 'S' AND LOWER(p.per_descricao) LIKE '%profissional%'
            ORDER BY u.usu_nome
        `;
        const rows = await banco.ExecutaComando(sql, []);
        return rows.map(row => this.fromRow(row));
    }
}

module.exports = UsuarioModel;
