document.addEventListener("DOMContentLoaded", function() {

    let btns = document.querySelectorAll(".btnExcluir");

    for(let i = 0; i<btns.length; i++) {
        btns[i].addEventListener("click", excluir);
    }

    // filtros
    var q = document.getElementById('f_q');
    var status = document.getElementById('f_status');
    var min = document.getElementById('f_min');
    var max = document.getElementById('f_max');

    function applyFilters(){
        var params = new URLSearchParams();
        if(q && q.value.trim() !== '') params.set('q', q.value.trim());
        if(status && status.value !== 'all') params.set('status', status.value);
        if(min && min.value !== '') params.set('minValor', min.value);
        if(max && max.value !== '') params.set('maxValor', max.value);
        window.location = '/servicos?' + params.toString();
    }

    [q, status, min, max].forEach(function(el){
        if(!el) return;
        el.addEventListener('change', applyFilters);
        el.addEventListener('keyup', function(e){ if(e.key === 'Enter') applyFilters(); });
    });

    function excluir() {
        let id = this.dataset.id;

        if(id != null) {
            if(confirm("Tem certeza que deseja excluir esse serviço?")) {
                let obj = {
                    id: id
                }

                fetch('/servicos/excluir', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(obj)
                })
                .then(r => {
                    return r.json()
                })
                .then(r=> {
                    if(r.ok) {
                        window.location.reload();
                    }
                    else{
                        alert(r.msg);
                    }

                })

            }
        }
        else{
            alert("Nenhum ID encontrado para exclusão");
        }
    }

})
