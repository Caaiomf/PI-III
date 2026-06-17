document.addEventListener("DOMContentLoaded", function() {
    let listaCarrinho = [];
    const carrinho = localStorage.getItem("carrinho");

    if(carrinho) {
        listaCarrinho = JSON.parse(carrinho);
    }

    atualizarContador();
    calcularValorTotal();

    document.querySelectorAll(".addCarrinho").forEach(function(btn) {
        btn.addEventListener("click", adicionarAoCarrinho);
    });

    document.addEventListener("show.bs.modal", abrirCarrinho);
    document.querySelector("#btnConfirmar").addEventListener("click", gravarPedido);

    function salvarCarrinho() {
        localStorage.setItem("carrinho", JSON.stringify(listaCarrinho));
    }

    function gravarPedido() {
        if(listaCarrinho.length === 0) {
            alert("Nenhum produto adicionado ao carrinho!");
            return;
        }

        const endereco = document.getElementById("checkoutEndereco").value.trim();
        const cidade = document.getElementById("checkoutCidade").value.trim();
        const estado = document.getElementById("checkoutEstado").value.trim();

        if(!endereco || !cidade || !estado) {
            alert("Informe endereço, cidade e estado para finalizar a compra.");
            return;
        }

        fetch("/pedido/gravar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endereco, cidade, estado, itens: listaCarrinho })
        })
        .then(function(resposta) { return resposta.json(); })
        .then(function(corpo) {
            alert(corpo.msg);

            if(corpo.precisaLogin) {
                window.location.href = "/login";
                return;
            }

            if(corpo.ok) {
                localStorage.removeItem("carrinho");
                listaCarrinho = [];
                abrirCarrinho();
                atualizarContador();
                calcularValorTotal();
            }
        })
        .catch(function() {
            alert("Erro ao finalizar pedido.");
        });
    }

    function excluirProdutoCarrinho() {
        let produtoIdExcluir = this.dataset.produto;
        listaCarrinho = listaCarrinho.filter(x => x.id != produtoIdExcluir);
        salvarCarrinho();
        atualizarContador();
        calcularValorTotal();
        abrirCarrinho();
    }

    function alterarQuantidade(produtoId, delta) {
        const item = listaCarrinho.find(x => x.id == produtoId);
        if(!item) return;

        const estoque = parseInt(item.estoque || 0);
        const novaQuantidade = parseInt(item.quantidade) + delta;

        if(novaQuantidade <= 0) {
            listaCarrinho = listaCarrinho.filter(x => x.id != produtoId);
        } else if(novaQuantidade > estoque) {
            alert(`Só há ${estoque} unidade(s) deste produto em estoque.`);
        } else {
            item.quantidade = novaQuantidade;
        }

        salvarCarrinho();
        atualizarContador();
        calcularValorTotal();
        abrirCarrinho();
    }

    function calcularValorTotal() {
        let valorTotal = 0;
        for(let i = 0; i < listaCarrinho.length; i++) {
            valorTotal += listaCarrinho[i].quantidade * listaCarrinho[i].preco;
        }
        document.querySelector("#valorTotalPedido").innerHTML = "Valor total do pedido: R$ " + valorTotal.toFixed(2);
    }

    function atualizarContador() {
        let contador = document.querySelector("#contadorCarrinho");
        contador.innerHTML = listaCarrinho.reduce(function(total, item) {
            return total + parseInt(item.quantidade || 0);
        }, 0);
    }

    function abrirCarrinho() {
        if(listaCarrinho.length === 0) {
            document.getElementById("modalCarrinhoCorpo").innerHTML = "Carrinho vazio!";
            return;
        }

        let html = `<table class="table align-middle">
            <thead>
                <tr>
                    <th>Imagem</th>
                    <th>Nome</th>
                    <th>Valor Unitário</th>
                    <th>Quantidade</th>
                    <th>Valor Total</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>{corpo}</tbody>
        </table>
        <div class="row g-2 mt-3">
            <div class="col-md-6">
                <label class="form-label fw-semibold" for="checkoutEndereco">Endereço de entrega</label>
                <input id="checkoutEndereco" class="form-control" placeholder="Rua, número e bairro" required>
            </div>
            <div class="col-md-4">
                <label class="form-label fw-semibold" for="checkoutCidade">Cidade</label>
                <input id="checkoutCidade" class="form-control" placeholder="Cidade" required>
            </div>
            <div class="col-md-2">
                <label class="form-label fw-semibold" for="checkoutEstado">Estado</label>
                <input id="checkoutEstado" class="form-control" placeholder="UF" maxlength="2" required>
            </div>
        </div>`;

        let corpo = "";
        for(let i = 0; i < listaCarrinho.length; i++) {
            const item = listaCarrinho[i];
            corpo += `<tr>
                <td><img width="50" src="${item.imagem}" /></td>
                <td>${item.nome}<br><small class="text-muted">Estoque: ${item.estoque}</small></td>
                <td>R$ ${Number(item.preco).toFixed(2)}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" data-produto="${item.id}" class="btn btn-outline-secondary diminuirCarrinho">-</button>
                        <button type="button" class="btn btn-light" disabled>${item.quantidade}</button>
                        <button type="button" data-produto="${item.id}" class="btn btn-outline-secondary aumentarCarrinho">+</button>
                    </div>
                </td>
                <td>R$ ${(item.quantidade * item.preco).toFixed(2)}</td>
                <td><button data-produto="${item.id}" class="btn btn-danger excluirCarrinho"><i class="fas fa-trash"></i></button></td>
            </tr>`;
        }

        document.getElementById("modalCarrinhoCorpo").innerHTML = html.replace("{corpo}", corpo);

        document.querySelectorAll(".excluirCarrinho").forEach(btn => btn.addEventListener("click", excluirProdutoCarrinho));
        document.querySelectorAll(".diminuirCarrinho").forEach(btn => btn.addEventListener("click", function(){ alterarQuantidade(this.dataset.produto, -1); }));
        document.querySelectorAll(".aumentarCarrinho").forEach(btn => btn.addEventListener("click", function(){ alterarQuantidade(this.dataset.produto, 1); }));
    }

    function adicionarAoCarrinho() {
        let produtoId = this.dataset.produto;
        let that = this;

        if(!produtoId) {
            alert("ID do produto não encontrado!");
            return;
        }

        let existente = listaCarrinho.find(x => x.id == produtoId);
        if(existente) {
            alterarQuantidade(produtoId, 1);
            return;
        }

        fetch("/produto/obter/" + produtoId)
            .then(function(response) { return response.json(); })
            .then(function(corpo) {
                if(!corpo.produto || parseInt(corpo.produto.estoque || 0) <= 0) {
                    alert("Produto sem estoque.");
                    return;
                }

                corpo.produto.quantidade = 1;
                listaCarrinho.push(corpo.produto);
                salvarCarrinho();
                atualizarContador();
                calcularValorTotal();

                that.innerHTML = "<i class='fas fa-check'></i> Adicionado!";
                setTimeout(function() {
                    that.innerHTML = "<i class='bi-cart-fill me-1'></i> Adicionar ao carrinho";
                }, 3000);
            })
            .catch(function() {
                alert("Erro ao adicionar produto ao carrinho.");
            });
    }
});
