const Database = require("../db/database");

const banco = new Database();

class PedidoModel {

    #pedidoId;
    #pedidoData;
    #pedidoValorTotal;
    #clienteId;
    #endereco;
    #cidade;
    #estado;

    get pedidoId() {
        return this.#pedidoId;
    }
    set pedidoId(pedidoId){
        this.#pedidoId = pedidoId;
    }

    get pedidoData() {
        return this.#pedidoData;
    }
    set pedidoData(pedidoData){
        this.#pedidoData = pedidoData;
    }

    get pedidoValorTotal() {
        return this.#pedidoValorTotal;
    }

    set pedidoValorTotal(value) {
        this.#pedidoValorTotal = value;
    }

    get clienteId() {
        return this.#clienteId;
    }

    set clienteId(value) {
        this.#clienteId = value;
    }

    get endereco() {
        return this.#endereco;
    }

    set endereco(value) {
        this.#endereco = value;
    }

    get cidade() {
        return this.#cidade;
    }

    set cidade(value) {
        this.#cidade = value;
    }

    get estado() {
        return this.#estado;
    }

    set estado(value) {
        this.#estado = value;
    }

    constructor(pedidoId, pedidoData, pedidoValorTotal, clienteId, endereco, cidade, estado) {
        this.#pedidoId = pedidoId;
        this.#pedidoData = pedidoData;
        this.#pedidoValorTotal = pedidoValorTotal;
        this.#clienteId = clienteId;
        this.#endereco = endereco;
        this.#cidade = cidade;
        this.#estado = estado;
    }



    async listar() {
        let sql = "select * from tb_pedido";

        let valores = [];

        let rows = await banco.ExecutaComando(sql, valores);

        let listaPedidos = [];

        for(let i =0; i< rows.length; i++) {
            let row = rows[i];
            listaPedidos.push(new PedidoModel(row["ped_id"], row["ped_data"], row["ped_valortotal"], row["cli_id"], row["ped_endereco"], row["ped_cidade"], row["ped_estado"]));
        }

        return listaPedidos;
    }

    async gravar() {
        //now() é um função do mysql para retornar a data e hora atual
        let sql = "insert into tb_pedido (cli_id, ped_data, ped_status, ped_forma_pagamento, ped_endereco, ped_cidade, ped_estado) values (?, now(), ?, ?, ?, ?, ?)";     
        let valores = [this.#clienteId, 'PENDENTE', 'PIX', this.#endereco, this.#cidade, this.#estado];
        
        let result = await banco.ExecutaComandoLastInserted(sql, valores);
        this.#pedidoId = result;
        return result;
    }

    async atualizar() {
        let sql = "update tb_pedido set ped_valortotal = ? where ped_id = ?";

        let valores = [this.#pedidoValorTotal, this.#pedidoId];

        let result = await banco.ExecutaComandoLastInserted(sql, valores);

        return result;
    }

}

module.exports = PedidoModel;
