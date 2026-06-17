const RelatorioModel = require('../models/relatorioModel');

class RelatorioController {
  // Exibir página inicial de relatórios
  static async renderRelatorios(req, res) {
    try {
      res.render('relatorios/index', {
        title: 'Relatórios - Vitalis',
        layout: 'layout'
      });
    } catch (erro) {
      console.error('Erro ao renderizar página de relatórios:', erro);
      res.status(500).json({ erro: 'Erro ao carregar página' });
    }
  }

  // Relatório 1: Produtos com Estoque Baixo
  static async getProdutosBaixoEstoque(req, res) {
    try {
      const resultados = await RelatorioModel.getProdutosBaixoEstoque();
      res.json(resultados);
    } catch (erro) {
      console.error('Erro ao gerar relatório de produtos:', erro);
      res.status(500).json({ erro: 'Erro ao gerar relatório' });
    }
  }

  // Relatório 2: Vendas por Período
  static async getVendasPeriodo(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;

      if (!dataInicio || !dataFim) {
        return res.status(400).json({ erro: 'Datas obrigatórias' });
      }

      const resultados = await RelatorioModel.getVendasPeriodo({
        dataInicio,
        dataFim
      });

      res.json(resultados);
    } catch (erro) {
      console.error('Erro ao gerar relatório de vendas:', erro);
      res.status(500).json({ erro: 'Erro ao gerar relatório' });
    }
  }

  // Relatório 3: Produtos Mais Vendidos
  static async getProdutosMaisVendidos(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;

      if (!dataInicio || !dataFim) {
        return res.status(400).json({ erro: 'Datas obrigatórias' });
      }

      const resultados = await RelatorioModel.getProdutosMaisVendidos({
        dataInicio,
        dataFim
      });

      res.json(resultados);
    } catch (erro) {
      console.error('Erro ao gerar relatório de produtos mais vendidos:', erro);
      res.status(500).json({ erro: 'Erro ao gerar relatório' });
    }
  }

  // Relatório 4: Tipos de Serviços Cadastrados
  static async getServicosCadastrados(req, res) {
    try {
      const { status, q } = req.query;
      const resultados = await RelatorioModel.getServicosCadastrados({ status, q });
      res.json(resultados);
    } catch (erro) {
      console.error('Erro ao gerar relatório de serviços:', erro);
      res.status(500).json({ erro: 'Erro ao gerar relatório' });
    }
  }

  static async getAgendamentosPeriodo(req, res) {
    try {
      const { dataInicio, dataFim, status } = req.query;
      const resultados = await RelatorioModel.getAgendamentosPeriodo({ dataInicio, dataFim, status });
      res.json(resultados);
    } catch (erro) {
      console.error('Erro ao gerar relatório de agendamentos:', erro);
      res.status(500).json({ erro: 'Erro ao gerar relatório' });
    }
  }

  // Exportar relatório como CSV
  static async exportarCSV(req, res) {
    try {
      const { relatorio, dataInicio, dataFim } = req.query;

      let dados = [];

      switch (relatorio) {
        case 'estoque':
          dados = await RelatorioModel.getProdutosBaixoEstoque();
          break;
        case 'vendas':
          if (!dataInicio || !dataFim) {
            return res.status(400).json({ erro: 'Datas obrigatórias' });
          }
          dados = await RelatorioModel.getVendasPeriodo({
            dataInicio,
            dataFim
          });
          break;
        case 'produtos':
          if (!dataInicio || !dataFim) {
            return res.status(400).json({ erro: 'Datas obrigatórias' });
          }
          dados = await RelatorioModel.getProdutosMaisVendidos({
            dataInicio,
            dataFim
          });
          break;
        case 'servicos':
          dados = await RelatorioModel.getServicosCadastrados();
          break;
        case 'agendamentos':
          dados = await RelatorioModel.getAgendamentosPeriodo({ dataInicio, dataFim, status: req.query.status });
          break;
        default:
          return res.status(400).json({ erro: 'Relatório inválido' });
      }

      const csv = RelatorioController.converterParaCSV(dados, relatorio);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="relatorio_${relatorio}_${Date.now()}.csv"`
      );
      res.send(csv);
    } catch (erro) {
      console.error('Erro ao exportar relatório:', erro);
      res.status(500).json({ erro: 'Erro ao exportar' });
    }
  }

  // Converter dados para CSV
  static converterParaCSV(dados, tipoRelatorio) {
    if (!dados || dados.length === 0) {
      return 'Sem dados para exportar';
    }

    const headers = Object.keys(dados[0]);
    const csv = [headers.join(',')];

    dados.forEach(linha => {
      const valores = headers.map(header => {
        const valor = linha[header];
        if (typeof valor === 'string' && valor.includes(',')) {
          return `"${valor}"`;
        }
        return valor || '';
      });
      csv.push(valores.join(','));
    });

    return csv.join('\n');
  }
}

module.exports = RelatorioController;
