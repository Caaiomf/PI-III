const Database = require("../db/database");

const banco = new Database();

class PedidoItemModel {

    #pedidodoItemId;
    #pedidoId;
    #produtoId;
    #pedidoItemQuantidade;
    #pedidoItemValor;
    #pedidoItemValorTotal;
    #produtoNome;
    #pedidoValorTotal;

    get pedidoItemId() {
        return this.#pedidodoItemId;
    }
    set pedidoItemId(pedidoItemId) {
        this.#pedidodoItemId = pedidoItemId;
    }

    get pedidoId() {
        return this.#pedidoId;
    }
    set pedidoId(pedidoId) {
        this.#pedidoId = pedidoId;
    }

    get produtoId() {
        return this.#produtoId;
    }
    set produtoId(produtoId) {
        this.#produtoId = produtoId;
    }

    get pedidoItemQuantidade() {
        return this.#pedidoItemQuantidade;
    }
    set pedidoItemQuantidade(pedidoItemQuantidade) {
        this.#pedidoItemQuantidade = pedidoItemQuantidade;
    }

    get pedidoItemValor() {
        return this.#pedidoItemValor;
    }
    set pedidoItemValor(pedidoItemValor) {
        this.#pedidoItemValor = pedidoItemValor;
    }

    get pedidoItemValorTotal() {
        return this.#pedidoItemValorTotal;
    }
    set pedidoItemValorTotal(pedidoItemValorTotal) {
        this.#pedidoItemValorTotal = pedidoItemValorTotal;
    }

    get produtoNome() {
        return this.#produtoNome;
    }

    set produtoNome(value) {
        this.#produtoNome = value;
    }

    get pedidoValorTotal() {
        return this.#pedidoValorTotal;
    }

    set pedidoValorTotal(value) {
        this.#pedidoValorTotal = value;
    }

    constructor(pedidodoItemId, pedidoId, produtoId, pedidoItemQuantidade, pedidoItemValor, pedidoItemValorTotal, produtoNome, pedidoValorTotal) {
        this.#pedidodoItemId = pedidodoItemId;
        this.#pedidoId = pedidoId;
        this.#produtoId = produtoId;
        this.#pedidoItemQuantidade = pedidoItemQuantidade;
        this.#pedidoItemValor = pedidoItemValor;
        this.#pedidoItemValorTotal = pedidoItemValorTotal;
        this.#produtoNome = produtoNome;
        this.#pedidoValorTotal = pedidoValorTotal;
    }

       async listarPedidosItens() {

        // aceitar filtros: { q, dataInicio, dataFim, minTotal, maxTotal }
        const args = arguments[0] || {};
        const q = args.q;
        const dataInicio = args.dataInicio;
        const dataFim = args.dataFim;
        const minTotal = args.minTotal;
        const maxTotal = args.maxTotal;

        let sqlWhere = "";
        let valores = [];
        if (q && q.trim() !== '') {
            // buscar por nome do produto ou id do pedido
            if (!isNaN(q)) {
                sqlWhere += (sqlWhere ? ' AND ' : ' WHERE ') + 'p.ped_id = ?';
                valores.push(q);
            } else {
                sqlWhere += (sqlWhere ? ' AND ' : ' WHERE ') + 'pr.prd_nome LIKE ?';
                valores.push('%' + q.trim() + '%');
            }
        }
        if (dataInicio) {
            sqlWhere += (sqlWhere ? ' AND ' : ' WHERE ') + 'p.ped_data >= ?';
            valores.push(dataInicio);
        }
        if (dataFim) {
            sqlWhere += (sqlWhere ? ' AND ' : ' WHERE ') + 'p.ped_data <= ?';
            valores.push(dataFim);
        }
        if (minTotal) {
            sqlWhere += (sqlWhere ? ' AND ' : ' WHERE ') + 'p.ped_valortotal >= ?';
            valores.push(minTotal);
        }
        if (maxTotal) {
            sqlWhere += (sqlWhere ? ' AND ' : ' WHERE ') + 'p.ped_valortotal <= ?';
            valores.push(maxTotal);
        }

        let sql = `select p.ped_id, p.ped_valortotal, p.ped_endereco, p.ped_cidade, p.ped_estado,
                    u.usu_nome, u.usu_email, pr.prd_nome, 
                    i.pit_quantidade , i.pit_valorunidade, i.pit_valortotal
                    from tb_pedido p 
                        inner join tb_pedidoitens i on p.ped_id = i.ped_id
                        inner join tb_produto pr on i.prd_id = pr.prd_id
                        left join tb_cliente c on c.cli_id = p.cli_id
                        left join tb_usuario u on u.usu_id = c.usu_id
                        ${sqlWhere}
                        order by 1`;

        let rows = await banco.ExecutaComando(sql, valores);
        let lista = [];
        for(let i = 0; i< rows.length; i++) {
            //mapeamento
            let row = rows[i];
            lista.push({
                pedidoId: row["ped_id"],
                pedidoValor: row["ped_valortotal"],
                compradorNome: row["usu_nome"] || "Cliente não identificado",
                compradorEmail: row["usu_email"] || "",
                endereco: row["ped_endereco"] || "",
                cidade: row["ped_cidade"] || "",
                estado: row["ped_estado"] || "",
                itemQuantidade: row["pit_quantidade"],
                itemValor: row["pit_valorunidade"],
                itemValorTotal: row["pit_valortotal"],
                itemNome: row["prd_nome"]
            });
        }            

        return lista;
    }

    async listar() {
        let sql = "select * from tb_pedidoitens";

        let valores = [];

        let rows = await banco.ExecutaComando(sql, valores);

        let listaItens = [];

        for(let i = 0; i< rows.length; i++) {
            let row = rows[i];
            listaItens.push(new PedidoItemModel(row["pit_id"], row["ped_id"], row["prd_id"], row["pit_quantidade"], row["pit_valorunitario"], row["pit_valortotal"]));
        }

        return listaItens;
    }

    async gravar() {
        let sql = "insert into tb_pedidoitens (ped_id, prd_id, pit_quantidade, pit_valorunidade, pit_valortotal) values (?, ?, ?, ?, ?)";

        let valores = [this.#pedidoId, this.#produtoId, this.#pedidoItemQuantidade, this.#pedidoItemValor, this.#pedidoItemValorTotal];

        let result = await banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

    toJSON() {
        return {
            pedidoId: this.#pedidoId,
            pedidoValor: this.#pedidoValorTotal,
            itemQuantidade: this.#pedidoItemQuantidade,
            itemValor: this.#pedidoItemValor,
            itemValorTotal: this.#pedidoItemValorTotal,
            itemNome: this.#produtoNome
        }
    }
}

module.exports = PedidoItemModel;
