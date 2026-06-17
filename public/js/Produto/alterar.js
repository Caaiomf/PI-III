document.addEventListener("DOMContentLoaded", function(){

    var btnGravar = document.getElementById("btnAlterar");

    btnGravar.addEventListener("click", alterarProduto);

    let inputArquivo = document.getElementById("inputImagem");
    inputArquivo.addEventListener("change", carregarPrevia);
})

function carregarPrevia() {
    if(this.files.length > 0) {
        let img = document.getElementById("previaImagem");
        let urlImg = URL.createObjectURL(this.files[0]);
        img.src = urlImg;
        document.getElementById("divPrevia").style.display = "block";
    }
}


function alterarProduto() {

    
    var inputId = document.getElementById("inputId");
    var inputCodigo = document.getElementById("inputCodigo");
    var inputNome = document.getElementById("inputNome");
    var inputQtde = document.getElementById("inputQtde");
    var inputPreco = document.getElementById("inputPreco");
    var selMarca = document.getElementById("selMarca");
    var selCategoria = document.getElementById("selCategoria");
    var inputImagem = document.getElementById("inputImagem")

    //if de validação básica
    if(inputCodigo.value != "" && inputNome.value != "" && inputQtde.value != "" && selMarca.value != '0' && selCategoria.value != '0' && inputPreco.value != ""){

        let formData = new FormData();
        
        formData.append("id", inputId.value);
        formData.append("codigo", inputCodigo.value);
        formData.append("nome", inputNome.value);
        formData.append("preco", inputPreco.value);
        formData.append("quantidade", inputQtde.value);
        formData.append("marca", selMarca.value);
        formData.append("categoria", selCategoria.value);
        if(inputImagem.files.length > 0)
            formData.append("imagem", inputImagem.files[0]);

        fetch('/produto/alterar', {
            method: "POST",
            body: formData
        })
        .then(r => {
            return r.json();
        })
        .then(r=> {
            if(r.ok) {
                alert("Produto alterado!");
            }
            else{
                alert("Erro ao alterar produto");
            }
        })
        .catch(e => {
            alert("Erro ao alterar produto");
        })

    }
    else{
        alert("Preencha todos os campos corretamente!");
        return;
    }
}
