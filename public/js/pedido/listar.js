document.addEventListener("DOMContentLoaded", function() {

    carregarPedidos();

    let btnBuscar = document.querySelector("#btnBuscar");

    btnBuscar.addEventListener("click", function() {
        //lê os filtros
        let parametro = document.querySelector("#txtBusca").value;
        let dataInicio = document.querySelector('#f_data_inicio').value;
        let dataFim = document.querySelector('#f_data_fim').value;
        let minTotal = document.querySelector('#f_min_total').value;
        let maxTotal = document.querySelector('#f_max_total').value;
        carregarPedidos({ q: parametro, dataInicio, dataFim, minTotal, maxTotal });
    })

    function carregarPedidos(filtros) {
        let url = '/pedido/listar';
        if(filtros) {
            const p = new URLSearchParams();
            if(filtros.q) p.set('q', filtros.q);
            if(filtros.dataInicio) p.set('dataInicio', filtros.dataInicio);
            if(filtros.dataFim) p.set('dataFim', filtros.dataFim);
            if(filtros.minTotal) p.set('minTotal', filtros.minTotal);
            if(filtros.maxTotal) p.set('maxTotal', filtros.maxTotal);
            url += '?' + p.toString();
        }
        fetch(url)
        .then(function(resposta) {
            return resposta.json();
        })
        .then(function(corpo) {
            montarTabela(corpo);
        })
    }

    function montarTabela(listaPedidos) {
        let html = "";

        for(let i = 0; i < listaPedidos.length; i++) {
            html += `<tr>
                        <td>${listaPedidos[i].pedidoId}</td>
                        <td>${listaPedidos[i].compradorNome || ''}<br><small>${listaPedidos[i].compradorEmail || ''}</small></td>
                        <td>${listaPedidos[i].endereco || ''}<br><small>${listaPedidos[i].cidade || ''}${listaPedidos[i].estado ? ' - ' + listaPedidos[i].estado : ''}</small></td>
                        <td>R$ ${listaPedidos[i].pedidoValor}</td>
                        <td>${listaPedidos[i].itemNome}</td>
                        <td>${listaPedidos[i].itemQuantidade}</td>
                        <td>R$ ${listaPedidos[i].itemValor}</td>
                        <td>R$ ${listaPedidos[i].itemValorTotal}</td>
                    </tr>`;
        }

        document.querySelector("#tabelaPedidos > tbody").innerHTML = html;
    }
})
