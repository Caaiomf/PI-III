document.addEventListener("DOMContentLoaded", function() {

    document.getElementById("btnCadastrar").addEventListener("click", cadastrar);

    function limparValidacao() {
        document.getElementById("servicoNome").style["border-color"] = "#ced4da";
        document.getElementById("servicoValor").style["border-color"] = "#ced4da";
    }

    function cadastrar() {
        limparValidacao();
        let nome = document.querySelector("#servicoNome").value;
        let valor = document.querySelector("#servicoValor").value;
        let ativo = document.querySelector("#servicoAtivo").checked;

        let listaErros = [];
        if(nome == "") {
            listaErros.push("servicoNome");
        }
        if(valor == "" || valor == 0) {
            listaErros.push("servicoValor");
        }

        if(listaErros.length == 0) {
            //enviar ao backend com fetch

            let obj = {
                nome: nome,
                valor: valor,
                ativo: ativo ? '1' : '0',
            }

            fetch("/servicos/cadastro", {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: {
                    "Content-Type": "application/json",
                }
            })
            .then(r=> {
                return r.json();
            })
            .then(r=> {
                if(r.ok) {
                    window.location.href="/servicos";
                }   
                else {
                    alert(r.msg);
                }
            })
        }
        else{
            //avisar sobre o preenchimento incorreto
            for(let i = 0; i < listaErros.length; i++) {
                let campos = document.getElementById(listaErros[i]);
                campos.style["border-color"] = "red";
            }
            alert("Preencha corretamente os campos indicados!");
        }
    }

})
