const Database = require("../db/database");
const banco = new Database();

class RelatorioModel {
  // Relatório 1: Produtos com Estoque Baixo
  static async getProdutosBaixoEstoque() {
    try {
      const query = `
        SELECT 
          p.prd_id as id,
          p.prd_nome as nome,
          p.prd_quantidade as quantidade,
          p.prd_valor as valor,
          c.cat_nome as categoria,
          m.mar_nome as marca,
          CASE 
            WHEN p.prd_quantidade < 5 THEN 'CRÍTICO'
            WHEN p.prd_quantidade < 10 THEN 'BAIXO'
            ELSE 'NORMAL'
          END as situacao
        FROM tb_produto p
        LEFT JOIN tb_categoria c ON p.cat_id = c.cat_id
        LEFT JOIN tb_marca m ON p.mar_id = m.mar_id
        WHERE p.prd_quantidade < 15
        ORDER BY p.prd_quantidade ASC
      `;
      
      const resultado = await banco.ExecutaComando(query, []);
      return resultado || [];
    } catch (erro) {
      console.error('Erro ao gerar relatório de produtos:', erro);
      throw erro;
    }
  }

  // Relatório 2: Vendas por Período (Pedidos)
  static async getVendasPeriodo(filtro) {
    try {
      const { dataInicio, dataFim } = filtro;
      
      const query = `
        SELECT 
          DATE(p.ped_data) as data,
          COUNT(DISTINCT p.ped_id) as totalPedidos,
          SUM(pi.pit_quantidade) as quantidadeTotal,
          SUM(pi.pit_valortotal) as valorTotal,
          DATE_FORMAT(DATE(p.ped_data), '%d/%m/%Y') as dataFormatada
        FROM tb_pedido p
        LEFT JOIN tb_pedidoitens pi ON p.ped_id = pi.ped_id
        WHERE DATE(p.ped_data) BETWEEN ? AND ?
        GROUP BY DATE(p.ped_data)
        ORDER BY p.ped_data DESC
      `;
      
      const resultado = await banco.ExecutaComando(query, [dataInicio, dataFim]);
      return resultado || [];
    } catch (erro) {
      console.error('Erro ao gerar relatório de vendas:', erro);
      throw erro;
    }
  }

  // Relatório 3: Produtos Mais Vendidos
  static async getProdutosMaisVendidos(filtro) {
    try {
      const { dataInicio, dataFim } = filtro;
      
      const query = `
        SELECT 
          pr.prd_id as id,
          pr.prd_nome as produto,
          COUNT(DISTINCT p.ped_id) as vezesVendido,
          SUM(pi.pit_quantidade) as quantidadeTotal,
          SUM(pi.pit_valortotal) as valorTotal,
          AVG(CASE WHEN pi.pit_quantidade = 0 THEN 0 ELSE (pi.pit_valortotal / pi.pit_quantidade) END) as valorMedio,
          c.cat_nome as categoria
        FROM tb_pedidoitens pi
        INNER JOIN tb_pedido p ON pi.ped_id = p.ped_id
        INNER JOIN tb_produto pr ON pi.prd_id = pr.prd_id
        LEFT JOIN tb_categoria c ON pr.cat_id = c.cat_id
        WHERE DATE(p.ped_data) BETWEEN ? AND ?
        GROUP BY pr.prd_id, pr.prd_nome, c.cat_nome
        ORDER BY quantidadeTotal DESC
        LIMIT 20
      `;
      
      const resultado = await banco.ExecutaComando(query, [dataInicio, dataFim]);
      return resultado || [];
    } catch (erro) {
      console.error('Erro ao gerar relatório de produtos mais vendidos:', erro);
      throw erro;
    }
  }

  // Relatório 4: Tipos de Serviços Cadastrados
  static async getServicosCadastrados() {
    try {
      // aceitar filtros opcionais: { status, q }
      const args = arguments[0] || {};
      const status = args.status;
      const q = args.q;

      let where = '';
      const valores = [];

      if (status === '1' || status === '0') {
        where += (where ? ' AND ' : ' WHERE ') + 's.stp_ativo = ?';
        valores.push(status);
      }

      if (q && q.trim() !== '') {
        where += (where ? ' AND ' : ' WHERE ') + 's.stp_nome LIKE ?';
        valores.push('%' + q.trim() + '%');
      }

      const query = `
        SELECT 
          s.stp_id as id,
          s.stp_nome as nomeServico,
          s.stp_valor as valor,
          CASE WHEN s.stp_ativo = 1 THEN 'Ativo' ELSE 'Inativo' END as status,
          DATE_FORMAT(s.stp_criado_em, '%d/%m/%Y') as dataCadastro
        FROM tb_servico_tipo s
        ${where}
        ORDER BY s.stp_nome ASC
      `;

      const resultado = await banco.ExecutaComando(query, valores);
      return resultado || [];
    } catch (erro) {
      console.error('Erro ao gerar relatório de serviços:', erro);
      throw erro;
    }
  }

  static async getAgendamentosPeriodo(filtro) {
    try {
      const args = filtro || {};
      let where = '';
      const valores = [];

      if(args.dataInicio) {
        where += (where ? ' AND ' : ' WHERE ') + 'a.age_data >= ?';
        valores.push(args.dataInicio);
      }
      if(args.dataFim) {
        where += (where ? ' AND ' : ' WHERE ') + 'a.age_data <= ?';
        valores.push(args.dataFim);
      }
      if(args.status && args.status !== 'all') {
        where += (where ? ' AND ' : ' WHERE ') + 'a.age_status = ?';
        valores.push(args.status);
      }

      const query = `
        SELECT
          DATE_FORMAT(a.age_data, '%d/%m/%Y') as data,
          TIME_FORMAT(a.age_hora, '%H:%i') as hora,
          s.stp_nome as servico,
          uc.usu_nome as cliente,
          up.usu_nome as profissional,
          a.age_status as status,
          s.stp_valor as valor
        FROM tb_agendamento a
        INNER JOIN tb_servico_tipo s ON s.stp_id = a.stp_id
        INNER JOIN tb_cliente c ON c.cli_id = a.cli_id
        INNER JOIN tb_usuario uc ON uc.usu_id = c.usu_id
        INNER JOIN tb_usuario up ON up.usu_id = a.pro_usu_id
        ${where}
        ORDER BY a.age_data DESC, a.age_hora DESC
      `;

      return await banco.ExecutaComando(query, valores);
    } catch (erro) {
      console.error('Erro ao gerar relatório de agendamentos:', erro);
      throw erro;
    }
  }

  // Método auxiliar: obter status
  static getStatusServicos() {
    return [
      { valor: '', label: 'Todos' },
      { valor: '1', label: 'Ativo' },
      { valor: '0', label: 'Inativo' }
    ];
  }
}

module.exports = RelatorioModel;
