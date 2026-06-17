document.addEventListener('DOMContentLoaded', function() {
    const tbItens = document.getElementById('tbItensRecebimento');
    const tbLista = document.getElementById('tbRecebimentos');

    document.getElementById('btnAddRecebimentoItem').addEventListener('click', function() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input class="r_produto" type="number" min="1" placeholder="ID produto"></td>
            <td><input class="r_qtd" type="number" min="1" value="1"></td>
            <td><input class="r_valor" type="number" step="0.01" min="0" value="0"></td>
            <td><input class="r_validade" type="date"></td>
            <td><button type="button" class="btn-rem">Remover</button></td>
        `;
        tbItens.querySelector('tbody').appendChild(row);
        row.querySelector('.btn-rem').addEventListener('click', function(){ row.remove(); });
    });

    document.getElementById('btnSalvarRecebimento').addEventListener('click', function() {
        const itens = [];
        tbItens.querySelectorAll('tbody tr').forEach(function(row) {
            const produtoId = row.querySelector('.r_produto').value;
            const quantidade = row.querySelector('.r_qtd').value;
            const valor = row.querySelector('.r_valor').value;
            const validade = row.querySelector('.r_validade').value;
            if (produtoId && quantidade) {
                itens.push({ produtoId, quantidade, valor, validade });
            }
        });

        if (itens.length === 0) {
            alert('Informe pelo menos um item.');
            return;
        }

        fetch('/recebimentos/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                funId: document.getElementById('recebimentoFuncionario').value || 1,
                data: document.getElementById('recebimentoData').value,
                observacao: document.getElementById('recebimentoObservacao').value,
                itens
            })
        })
        .then(r => r.json())
        .then(r => {
            alert(r.msg || (r.ok ? 'Recebimento registrado.' : 'Erro ao registrar.'));
            if (r.ok) window.location.reload();
        })
        .catch(() => alert('Erro ao registrar recebimento.'));
    });

    function carregarLista() {
        const p = new URLSearchParams();
        const produto = document.getElementById('f_produto').value.trim();
        const dataInicio = document.getElementById('f_data_inicio').value;
        const dataFim = document.getElementById('f_data_fim').value;
        if (produto) p.set('produto', produto);
        if (dataInicio) p.set('dataInicio', dataInicio);
        if (dataFim) p.set('dataFim', dataFim);

        fetch('/recebimentos/listar?' + p.toString())
            .then(r => r.json())
            .then(renderLista)
            .catch(() => renderLista([]));
    }

    function renderLista(rows) {
        if (!rows.length) {
            tbLista.querySelector('tbody').innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;">Nenhum recebimento encontrado.</td></tr>';
            return;
        }

        tbLista.querySelector('tbody').innerHTML = rows.map(function(r) {
            return `<tr>
                <td>${r.rec_id}</td>
                <td>${r.prd_nome || ''}</td>
                <td>${r.rit_quantidade || 0}</td>
                <td>R$ ${Number(r.rit_valorunidade || 0).toFixed(2)}</td>
                <td>${r.rit_validade ? new Date(r.rit_validade).toLocaleDateString('pt-BR') : '-'}</td>
                <td>${r.rec_data ? new Date(r.rec_data).toLocaleString('pt-BR') : '-'}</td>
                <td>${r.rec_observacao || ''}</td>
            </tr>`;
        }).join('');
    }

    document.getElementById('btnFiltrarRecebimentos').addEventListener('click', carregarLista);
    ['f_produto','f_data_inicio','f_data_fim'].forEach(function(id) {
        const el = document.getElementById(id);
        el.addEventListener('change', carregarLista);
        el.addEventListener('keyup', function(e){ if(e.key === 'Enter') carregarLista(); });
    });

    carregarLista();
});
