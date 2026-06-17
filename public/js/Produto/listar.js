document.addEventListener("DOMContentLoaded", function(){

    var listaBtns = document.querySelectorAll(".btnExcluir");

    for(var i = 0; i<listaBtns.length; i++) {
        listaBtns[i].addEventListener("click", excluirProduto);
    }
    // filtros: buscar, categoria, marca, min/max
    var q = document.getElementById('f_q');
    var cat = document.getElementById('f_categoria');
    var mar = document.getElementById('f_marca');
    var min = document.getElementById('f_min');
    var max = document.getElementById('f_max');

    function applyFilters(){
        var params = new URLSearchParams();
        if(q && q.value.trim() !== '') params.set('q', q.value.trim());
        if(cat && cat.value !== '0') params.set('categoria', cat.value);
        if(mar && mar.value !== '0') params.set('marca', mar.value);
        if(min && min.value !== '') params.set('minValor', min.value);
        if(max && max.value !== '') params.set('maxValor', max.value);
        window.location = '/produto?' + params.toString();
    }

    [q, cat, mar, min, max].forEach(function(el){
        if(!el) return;
        el.addEventListener('change', applyFilters);
        el.addEventListener('keyup', function(e){ if(e.key === 'Enter') applyFilters(); });
    });
    
})

function excluirProduto() {
    var codigo = this.dataset.codigo;
    if(confirm("Tem certeza que deseja excluir")) {
        if(codigo != ""){
            var data = {
                codigo: codigo
            }
            fetch("/produto/excluir", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            })
            .then(r=> {
                return r.json();
            })
            .then(r=> {
                if(r.ok){
                    window.location.reload();
                }
                else{
                    alert(r.msg || "Erro ao excluir produto");
                }
            })
            .catch(e => {
                alert("Erro ao excluir produto");
            })
        }
    }

}
