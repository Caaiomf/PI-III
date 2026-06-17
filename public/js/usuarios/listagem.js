document.addEventListener("DOMContentLoaded", function() {

    let btns = document.querySelectorAll(".btnExclusao");

    for(let i = 0; i<btns.length; i++) {
        btns[i].addEventListener("click", excluir);
    }

    // filtros
    var q = document.getElementById('f_q');
    var status = document.getElementById('f_status');
    var perfil = document.getElementById('f_perfil');
    var order = document.getElementById('f_order');

    function apply() {
        var params = new URLSearchParams();
        if(q && q.value.trim() !== '') params.set('q', q.value.trim());
        if(status && status.value !== 'all') params.set('status', status.value);
        if(perfil && perfil.value !== '0') params.set('perfil', perfil.value);
        if(order && order.value) params.set('order', order.value);
        window.location = '/usuarios?' + params.toString();
    }

    [q, status, perfil, order].forEach(function(el){
        if(!el) return;
        el.addEventListener('change', apply);
        el.addEventListener('keyup', function(e){ if(e.key === 'Enter') apply(); });
    });

    function excluir() {
        let id = this.dataset.codigoexclusao;

        if(id != null) {
            if(confirm("Tem certeza que deseja excluir esse usuário?")) {
                let obj = {
                    id: id
                }

                fetch('/usuarios/excluir', {
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
