document.addEventListener('DOMContentLoaded', function(){
    const btnAdd = document.getElementById('btnAddItem');
    const itensContainer = document.getElementById('itensCompra');
    const btnSalvar = document.getElementById('btnSalvarCompra');
    const btnFiltrar = document.getElementById('btnFiltrarCompras');
    const tabelaList = document.getElementById('tbCompras');
    const pager = document.getElementById('comprasPager');
    const totalCompra = document.getElementById('totalCompra');
    const pageSize = 10;
    const produtos = window.produtosCompra || [];

    function produtoOptions() {
        return ['<option value="">Selecione o produto</option>'].concat(produtos.map(function(p) {
            return `<option value="${p.id}" data-valor="${p.valor || 0}">${p.nome} - estoque ${p.estoque || 0}</option>`;
        })).join('');
    }

    function adicionarItem() {
        const row = document.createElement('div');
        row.className = 'item-grid compra-item';
        row.innerHTML = `
            <div>
                <div class="item-label">Produto</div>
                <select class="i_prd">${produtoOptions()}</select>
            </div>
            <div>
                <div class="item-label">Qtd</div>
                <input class="i_qt" type="number" value="1" min="1">
            </div>
            <div>
                <div class="item-label">Valor</div>
                <input class="i_vl" type="number" step="0.01" value="0">
            </div>
            <div>
                <div class="item-label">Lote</div>
                <input class="i_lote" placeholder="Obrigatório">
            </div>
            <div>
                <div class="item-label">Validade</div>
                <input class="i_val" type="date">
            </div>
            <div>
                <div class="item-label">&nbsp;</div>
                <button type="button" class="btn-rem">Remover</button>
            </div>
        `;
        itensContainer.appendChild(row);
        row.querySelector('.btn-rem').addEventListener('click', function(){
            row.remove();
            atualizarTotal();
            mostrarAjudaSeVazio();
        });
        row.querySelector('.i_prd').addEventListener('change', function(){
            const selected = this.options[this.selectedIndex];
            const valor = selected ? selected.dataset.valor : '';
            if(valor !== undefined) row.querySelector('.i_vl').value = valor || 0;
            atualizarTotal();
        });
        row.querySelector('.i_qt').addEventListener('input', atualizarTotal);
        row.querySelector('.i_vl').addEventListener('input', atualizarTotal);
        mostrarAjudaSeVazio();
    }

    function mostrarAjudaSeVazio() {
        let ajuda = document.getElementById('compraAjudaVazio');
        const vazio = itensContainer.querySelectorAll('.compra-item').length === 0;
        if(vazio && !ajuda) {
            ajuda = document.createElement('div');
            ajuda.id = 'compraAjudaVazio';
            ajuda.className = 'empty-help';
            ajuda.innerHTML = 'Adicione os produtos comprados. Use o campo de produto pelo nome em vez de digitar ID.';
            itensContainer.appendChild(ajuda);
        }
        if(!vazio && ajuda) ajuda.remove();
    }

    function atualizarTotal() {
        let total = 0;
        itensContainer.querySelectorAll('.compra-item').forEach(function(row){
            const qt = parseFloat(row.querySelector('.i_qt').value || 0);
            const vl = parseFloat(row.querySelector('.i_vl').value || 0);
            total += qt * vl;
        });
        totalCompra.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
    }

    btnAdd.addEventListener('click', adicionarItem);

    btnSalvar.addEventListener('click', function(){
        const fornecedor = document.getElementById('compraFornecedor').value.trim();
        const data = document.getElementById('compraData').value;
        const status = document.getElementById('compraStatus').value;
        const items = [];

        itensContainer.querySelectorAll('.compra-item').forEach(function(row){
            const prd = row.querySelector('.i_prd').value;
            const qt = row.querySelector('.i_qt').value;
            const vl = row.querySelector('.i_vl').value;
            const lote = row.querySelector('.i_lote').value;
            const validade = row.querySelector('.i_val').value;
            if(prd && qt) items.push({ prd_id: prd, quantidade: qt, valor: vl, lote, validade });
        });

        if(!fornecedor || items.length === 0) {
            alert('Informe o fornecedor e pelo menos 1 item.');
            return;
        }

        const itemIncompleto = items.some(function(item) {
            return !item.prd_id || !item.quantidade || !item.valor || !item.lote || !item.validade;
        });

        if(itemIncompleto) {
            alert('Informe lote e validade em todos os itens da compra.');
            return;
        }

        fetch('/compras/cadastrar', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ fornecedor, data, status, items })
        })
        .then(r => r.json())
        .then(j => {
            if(j.ok) location.reload();
            else alert(j.msg || 'Erro');
        })
        .catch(() => alert('Erro ao salvar'));
    });

    function carregarLista(page){
        const p = new URLSearchParams();
        const fornecedor = document.getElementById('f_fornecedor').value.trim();
        const dataInicio = document.getElementById('f_data_inicio').value;
        const dataFim = document.getElementById('f_data_fim').value;
        const status = document.getElementById('f_status').value;

        p.set('page', page || 1);
        p.set('limit', pageSize);
        if(fornecedor) p.set('fornecedor', fornecedor);
        if(dataInicio) p.set('dataInicio', dataInicio);
        if(dataFim) p.set('dataFim', dataFim);
        if(status && status !== 'all') p.set('status', status);

        fetch('/compras/listar?' + p.toString(), { headers: { 'Accept': 'application/json' } })
            .then(r => r.json())
            .then(j => {
                renderTabela(j.rows || []);
                renderPager(j.total || 0, page || 1);
            })
            .catch(() => renderTabela([]));
    }

    function renderTabela(rows){
        let html = '';
        if(rows.length === 0) {
            html = '<tr><td colspan="8" style="text-align:center;color:#999;">Nenhuma compra encontrada.</td></tr>';
        } else {
            rows.forEach(function(row){
                const total = (parseFloat(row.com_quantidade || 0) * parseFloat(row.com_valorunitario || 0)).toFixed(2);
                const status = String(row.com_status || '').toLowerCase();
                const acao = status === 'pendente'
                    ? `<button type="button" class="btn-vitalis btn-receber" data-id="${row.com_id}" style="padding:7px 10px;"><i class="fas fa-check"></i> Receber</button>`
                    : '<span style="color:#1a7a4a;font-weight:700;">Estoque lançado</span>';
                html += `<tr>
                    <td>${row.com_id || ''}</td>
                    <td>${row.com_fornecedor || ''}</td>
                    <td>${row.com_lote || '-'}</td>
                    <td>${row.com_validade ? new Date(row.com_validade).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>${row.com_data ? new Date(row.com_data).toLocaleString('pt-BR') : ''}</td>
                    <td>R$ ${total}</td>
                    <td>${row.com_status || ''}</td>
                    <td>${acao}</td>
                </tr>`;
            });
        }
        tabelaList.querySelector('tbody').innerHTML = html;
        tabelaList.querySelectorAll('.btn-receber').forEach(function(btn) {
            btn.addEventListener('click', function() {
                receberCompra(this.dataset.id);
            });
        });
    }

    function receberCompra(id) {
        if(!confirm('Confirmar recebimento desta compra e adicionar a quantidade ao estoque?')) return;

        fetch('/compras/status', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ id, status: 'recebido' })
        })
        .then(r => r.json())
        .then(j => {
            alert(j.msg || (j.ok ? 'Status atualizado.' : 'Erro'));
            if(j.ok) carregarLista(1);
        })
        .catch(() => alert('Erro ao atualizar status.'));
    }

    function renderPager(total, page){
        const pages = Math.max(1, Math.ceil(total / pageSize));
        let html = '';
        for(let i = 1; i <= pages; i++){
            html += `<button class="pgBtn" data-page="${i}" style="margin-right:6px; ${i === page ? 'font-weight:700;' : ''}">${i}</button>`;
        }
        pager.innerHTML = html;
        pager.querySelectorAll('.pgBtn').forEach(function(btn){
            btn.addEventListener('click', function(){ carregarLista(parseInt(this.dataset.page)); });
        });
    }

    btnFiltrar.addEventListener('click', function(){ carregarLista(1); });
    ['f_fornecedor','f_data_inicio','f_data_fim','f_status'].forEach(function(id){
        const el = document.getElementById(id);
        el.addEventListener('change', function(){ carregarLista(1); });
        el.addEventListener('keyup', function(e){ if(e.key === 'Enter') carregarLista(1); });
    });

    mostrarAjudaSeVazio();
    adicionarItem();
    carregarLista(1);
});
