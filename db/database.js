var mysql = require('mysql2');

class Database {

    #conexao;

    get conexao() { return this.#conexao;} 
    set conexao(conexao) { this.#conexao = conexao; }

    constructor() {

        this.#conexao = mysql.createPool({
            host: '132.226.245.178', //endereço do nosso banco de dados na nuvem
            database: 'PFS1_10442511203', //a database de cada um de vocês possui a nomenclatura PFS1_(RA)
            user: '10442511203', // usuario e senha de cada um de vocês é o RA
            password: '10442511203',
            waitForConnections: true,
            connectionLimit: 100, // Limite de conexões
            queueLimit: 0 // Sem limite na fila de conexões
        });
        
    }

    ExecutaComando(sql, valores) {
        var cnn = this.#conexao;
        return new Promise(function(res, rej) {
            cnn.query(sql, valores, function (error, results, fields) {
                if (error) 
                    rej(error);
                else 
                    res(results);
            });
        })
    }
    
    ExecutaComandoNonQuery(sql, valores) {
        var cnn = this.#conexao;
        return new Promise(function(res, rej) {
            cnn.query(sql, valores, function (error, results, fields) {
                if (error) 
                    rej(error);
                else 
                    res(results.affectedRows > 0);
            });
        })
    }

    ExecutaComandoLastInserted(sql, valores) {
        var cnn = this.#conexao;
        return new Promise(function(res, rej) {
            cnn.query(sql, valores, function (error, results, fields) {
                if (error) 
                    rej(error);
                else 
                    res(results.insertId);
            });
        })
    }

}

module.exports = Database;



