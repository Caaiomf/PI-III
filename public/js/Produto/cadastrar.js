document.addEventListener("DOMContentLoaded", function(){

    var btnGravar = document.getElementById("btnGravar");

    btnGravar.addEventListener("click", gravarProduto);

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

function gravarProduto() {

    var inputCodigo = document.getElementById("inputCodigo");
    var inputNome = document.getElementById("inputNome");
    var inputQtde = document.getElementById("inputQtde");
    var inputPreco = document.getElementById("inputPreco");
    var selMarca = document.getElementById("selMarca");
    var selCategoria = document.getElementById("selCategoria");
    var inputImagem = document.getElementById("inputImagem")

    //if de validação básica
    if(inputCodigo.value != "" && inputNome.value != "" && inputQtde.value != "" && inputQtde.value != '0' && selMarca.value != '0' && selCategoria.value != '0' && inputPreco.value != ""){

        // var data = {
        //     codigo: inputCodigo.value,
        //     nome: inputNome.value,
        //     quantidade: inputQtde.value,
        //     marca: selMarca.value,
        //     categoria: selCategoria.value
        // }
        let formData = new FormData();
        formData.append("codigo", inputCodigo.value);
        formData.append("nome", inputNome.value);        
        formData.append("preco", inputPreco.value);
        formData.append("quantidade", inputQtde.value);
        formData.append("marca", selMarca.value);
        formData.append("categoria", selCategoria.value);
        if(inputImagem.files.length > 0) {
            formData.append("imagem", inputImagem.files[0]);
        }

        fetch('/produto/cadastro', {
            method: "POST",
            body: formData
        })
        .then(r => {
            return r.json();
        })
        .then(r=> {
            if(r.ok) {
                alert("Produto cadastrado!");
            }
            else{
                alert("Erro ao cadastrar produto");
            }
        })
        .catch(e => {
            alert("Erro ao cadastrar produto");
        })

    }
    else{
        alert("Preencha todos os campos corretamente!");
        return;
    }
}
