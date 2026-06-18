const Database = require('../db/database');
const fs = require("fs");
const { inteiroPositivo, inteiroNaoNegativo, dinheiroNaoNegativo } = require('../utils/validacoes');

const conexao = new Database();
class ProdutoModel {

    #produtoId;
    #produtoCodigo;
    #produtoNome;
    #produtoQuantidade;
    #produtoValor;
    #produtoImagem;
    #categoriaId;
    #categoriaNome;
    #marcaId;
    #marcaNome;
    #promocaoAtiva;
    #valorPromocional;
    #promocaoDescricao;

    get produtoId() { return this.#produtoId; } set produtoId(produtoId) {this.#produtoId = produtoId;}
    get produtoCodigo() { return this.#produtoCodigo; } set produtoCodigo(produtoCodigo) {this.#produtoCodigo = produtoCodigo;}
    get produtoNome() { return this.#produtoNome; } set produtoNome(produtoNome) {this.#produtoNome = produtoNome;}
    get produtoQuantidade() { return this.#produtoQuantidade; } set produtoQuantidade(produtoQuantidade) {this.#produtoQuantidade = produtoQuantidade;}
    get categoriaId() { return this.#categoriaId; } set categoriaId(categoriaId) {this.#categoriaId = categoriaId;}
    get categoriaNome() { return this.#categoriaNome; } set categoriaNome(categoriaNome) {this.#categoriaNome = categoriaNome;}
    get marcaId() { return this.#marcaId; } set marcaId(marcaId) {this.#marcaId = marcaId;}
    get marcaNome() { return this.#marcaNome; } set marcaNome(marcaNome) {this.#marcaNome = marcaNome;}
    get produtoImagem() { return this.#produtoImagem; } set produtoImagem(produtoImagem) {this.#produtoImagem = produtoImagem;}
    get produtoValor() { return this.#produtoValor; } set produtoValor(produtoValor) {this.#produtoValor = produtoValor;}
    get promocaoAtiva() { return this.#promocaoAtiva; } set promocaoAtiva(promocaoAtiva) {this.#promocaoAtiva = promocaoAtiva;}
    get valorPromocional() { return this.#valorPromocional; } set valorPromocional(valorPromocional) {this.#valorPromocional = valorPromocional;}
    get promocaoDescricao() { return this.#promocaoDescricao; } set promocaoDescricao(promocaoDescricao) {this.#promocaoDescricao = promocaoDescricao;}



    constructor(produtoId, produtoCodigo, produtoNome, produtoQuantidade, categoriaId, marcaId, categoriaNome, marcaNome, produtoImagem, produtoValor, promocaoAtiva, valorPromocional, promocaoDescricao) {
        this.#produtoId = produtoId
        this.#produtoCodigo = produtoCodigo
        this.#produtoNome = produtoNome
        this.#produtoQuantidade = produtoQuantidade
        this.#categoriaId = categoriaId;
        this.#categoriaNome = categoriaNome;
        this.#marcaId = marcaId;
        this.#marcaNome = marcaNome;
        this.#produtoImagem = produtoImagem;
        this.#produtoValor = produtoValor;
        this.#promocaoAtiva = promocaoAtiva || 0;
        this.#valorPromocional = valorPromocional;
        this.#promocaoDescricao = promocaoDescricao;
    }

    async excluir(codigo){
        let sql = "delete from tb_produto where prd_id = ?"
        let valores = [codigo];

        var result = await conexao.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

    async possuiHistorico(codigo) {
        const consultas = [
            ['select count(*) total from tb_pedidoitens where prd_id = ?', [codigo]],
            ['select count(*) total from tb_compra where prd_id = ?', [codigo]],
            ['select count(*) total from tb_recebimentoitens where prd_id = ?', [codigo]],
            ['select count(*) total from tb_descarte where prd_id = ?', [codigo]]
        ];

        for(const consulta of consultas) {
            const rows = await conexao.ExecutaComando(consulta[0], consulta[1]);
            if(rows[0] && rows[0].total > 0) return true;
        }

        return false;
    }

    async gravar() {
        const quantidade = this.#produtoId == 0 ? inteiroPositivo(this.#produtoQuantidade) : inteiroNaoNegativo(this.#produtoQuantidade);
        const valor = dinheiroNaoNegativo(this.#produtoValor);
        if(quantidade === null || valor === null) return false;

        if(this.#produtoId == 0){
            let sql = "insert into tb_produto (prd_cod, prd_nome, prd_quantidade, cat_id, mar_id, prd_imagem, prd_valor) values (?, ?, ?, ?, ?, ?, ?)";

            let valores = [this.#produtoCodigo, this.#produtoNome, quantidade, this.#categoriaId, this.#marcaId, this.#produtoImagem, valor];

            return await conexao.ExecutaComandoNonQuery(sql, valores);
        }
        else{
            //alterar
            let sql = "update tb_produto set prd_cod = ?, prd_nome =?, prd_quantidade= ?, cat_id = ?, mar_id = ?, prd_imagem = ?, prd_valor = ? where prd_id = ?";

            let valores = [this.#produtoCodigo, this.#produtoNome,
                quantidade,
                this.#categoriaId, 
                this.#marcaId, this.#produtoImagem, valor, this.#produtoId];

            return await conexao.ExecutaComandoNonQuery(sql, valores) > 0;
        }
    }

    async buscarProduto(id){
        let sql = 'select * from tb_produto where prd_id = ? order by prd_id';
        let valores = [id];
        var rows = await conexao.ExecutaComando(sql, valores);

        let produto = null;

        if(rows.length > 0){
            var row = rows[0];

            //armazenamento em diretório
            let imagem = "";
            if(row["prd_imagem"] != null && 
                fs.existsSync(global.CAMINHO_IMG_ABS + row["prd_imagem"])) {
                imagem = global.CAMINHO_IMG + row["prd_imagem"];
            }
            else {
                imagem = global.CAMINHO_IMG + "produto-sem-imagem.webp";
            }
                    
            
            produto = new ProdutoModel(row['prd_id'], 
            row['prd_cod'], row['prd_nome'], row['prd_quantidade'], 
            row['cat_id'], row['mar_id'], "", "", imagem, row["prd_valor"], row["prd_promocao_ativa"], row["prd_valor_promocional"], row["prd_promocao_descricao"]);

        }

        return produto;
    }

    async baixarEstoque(id, quantidade) {
        const qtd = inteiroPositivo(quantidade);
        if(qtd === null) return false;

        let sql = 'update tb_produto set prd_quantidade = prd_quantidade - ? where prd_id = ? and prd_quantidade >= ?';
        return await conexao.ExecutaComandoNonQuery(sql, [qtd, id, qtd]);
    }

    async aumentarEstoque(id, quantidade) {
        const qtd = inteiroPositivo(quantidade);
        if(qtd === null) return false;

        let sql = 'update tb_produto set prd_quantidade = prd_quantidade + ? where prd_id = ?';
        return await conexao.ExecutaComandoNonQuery(sql, [qtd, id]);
    }

    async definirPromocao(id, valorPromocional, descricao) {
        let sql = 'update tb_produto set prd_promocao_ativa = 1, prd_valor_promocional = ?, prd_promocao_descricao = ? where prd_id = ?';
        return await conexao.ExecutaComandoNonQuery(sql, [valorPromocional, descricao || null, id]);
    }

    async removerPromocao(id) {
        let sql = 'update tb_produto set prd_promocao_ativa = 0, prd_valor_promocional = null, prd_promocao_descricao = null where prd_id = ?';
        return await conexao.ExecutaComandoNonQuery(sql, [id]);
    }

    async listarProdutos() {
        // aceitar filtros opcionais: { q, categoria, marca, minValor, maxValor }
        const args = arguments[0] || {};
        const q = args.q;
        const categoria = args.categoria;
        const marca = args.marca;
        const minValor = args.minValor;
        const maxValor = args.maxValor;

        let where = '';
        const valores = [];

        if (q && q.trim() !== '') {
            where += (where ? ' AND ' : ' WHERE ') + '(p.prd_nome LIKE ? OR p.prd_cod LIKE ?)';
            valores.push('%' + q.trim() + '%');
            valores.push('%' + q.trim() + '%');
        }
        if (categoria && categoria !== '0') {
            where += (where ? ' AND ' : ' WHERE ') + 'p.cat_id = ?';
            valores.push(categoria);
        }
        if (marca && marca !== '0') {
            where += (where ? ' AND ' : ' WHERE ') + 'p.mar_id = ?';
            valores.push(marca);
        }
        if (minValor) {
            where += (where ? ' AND ' : ' WHERE ') + 'p.prd_valor >= ?';
            valores.push(minValor);
        }
        if (maxValor) {
            where += (where ? ' AND ' : ' WHERE ') + 'p.prd_valor <= ?';
            valores.push(maxValor);
        }

        let sql = 'select * from tb_produto p inner join tb_categoria c on p.cat_id = c.cat_id inner join tb_marca m on p.mar_id = m.mar_id ' + where + ' order by prd_id';

        var rows = await conexao.ExecutaComando(sql, valores);

        let listaRetorno = [];

        if(rows.length > 0){
            for(let i=0; i<rows.length; i++){

                var row = rows[i];

                //converter binário da imagem em base64 (armazenamento em banco)
                // let imagemBase64 = "";
                // if(row["prd_imagem"] != null) {
                //     imagemBase64 = "data:image/png;base64," + row["prd_imagem"].toString("base64");
                // }

                //armazenamento em diretório
                let imagem = "";
                if(row["prd_imagem"] != null 
                    && 
                fs.existsSync(global.CAMINHO_IMG_ABS + row["prd_imagem"])) {
                    imagem = global.CAMINHO_IMG + row["prd_imagem"];
                }
                else {
                    imagem = global.CAMINHO_IMG + "produto-sem-imagem.webp";
                }
                    

                listaRetorno.push(new ProdutoModel(row['prd_id'], 
                row['prd_cod'], row['prd_nome'], row['prd_quantidade'], 
                row['cat_id'], row['mar_id'], row['cat_nome'], row['mar_nome'], imagem, row["prd_valor"], row["prd_promocao_ativa"], row["prd_valor_promocional"], row["prd_promocao_descricao"]));
            }
        }

        return listaRetorno;
    }

    valorVenda() {
        if(this.#promocaoAtiva && this.#valorPromocional) {
            return this.#valorPromocional;
        }
        return this.#produtoValor;
    }

    toJSON() {
        return {
            id: this.#produtoId,
            nome: this.#produtoNome,
            preco: this.valorVenda(),
            precoOriginal: this.#produtoValor,
            imagem: this.#produtoImagem,
            estoque: this.#produtoQuantidade,
            promocaoAtiva: this.#promocaoAtiva,
            promocaoDescricao: this.#promocaoDescricao
        }
    }

}

module.exports = ProdutoModel;
