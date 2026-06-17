document.addEventListener('DOMContentLoaded', function() {
    const filtro = document.getElementById('btnFiltrarAgendamentos');
    if(filtro) filtro.addEventListener('click', aplicarFiltros);

    ['f_q','f_data_inicio','f_data_fim','f_status'].forEach(function(id) {
        const el = document.getElementById(id);
        if(!el) return;
        el.addEventListener('change', aplicarFiltros);
        el.addEventListener('keyup', function(e) { if(e.key === 'Enter') aplicarFiltros(); });
    });

    document.querySelectorAll('.btn-status').forEach(function(btn) {
        btn.addEventListener('click', function() {
            atualizarStatus(this.dataset.id, this.dataset.status);
        });
    });

    document.querySelectorAll('.btn-reagendar').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const data = row.querySelector('.nova-data').value;
            const hora = row.querySelector('.nova-hora').value;
            const observacao = row.querySelector('.nova-obs').value;

            if(!data || !hora) {
                alert('Informe a nova data e hora.');
                return;
            }
            if(!dataValida(data)) {
                alert('Escolha uma data a partir de hoje, de segunda a sábado.');
                return;
            }
            if(!horaValida(hora)) {
                alert('Escolha um horário entre 06:00 e 19:00.');
                return;
            }

            fetch('/agendamentos/admin/reagendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: this.dataset.id, data, hora, observacao })
            })
            .then(r => r.json())
            .then(r => {
                alert(r.msg || 'Reagendamento atualizado.');
                if(r.ok) window.location.reload();
            })
            .catch(() => alert('Erro ao reagendar.'));
        });
    });

    function aplicarFiltros() {
        const p = new URLSearchParams();
        const q = document.getElementById('f_q').value.trim();
        const dataInicio = document.getElementById('f_data_inicio').value;
        const dataFim = document.getElementById('f_data_fim').value;
        const status = document.getElementById('f_status').value;
        if(q) p.set('q', q);
        if(dataInicio) p.set('dataInicio', dataInicio);
        if(dataFim) p.set('dataFim', dataFim);
        if(status && status !== 'all') p.set('status', status);
        window.location = '/agendamentos/admin?' + p.toString();
    }

    function atualizarStatus(id, status) {
        if(!confirm('Confirmar alteração do status para ' + status + '?')) return;
        fetch('/agendamentos/admin/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        })
        .then(r => r.json())
        .then(r => {
            alert(r.msg || 'Status atualizado.');
            if(r.ok) window.location.reload();
        })
        .catch(() => alert('Erro ao atualizar status.'));
    }

    function hojeISO() {
        const hoje = new Date();
        return hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
    }

    function dataValida(data) {
        const escolhido = new Date(data + 'T00:00:00');
        const hoje = new Date(hojeISO() + 'T00:00:00');
        return escolhido.getTime() >= hoje.getTime() && escolhido.getDay() !== 0;
    }

    function horaValida(hora) {
        const partes = hora.split(':');
        const minutos = (parseInt(partes[0]) * 60) + parseInt(partes[1] || '0');
        return minutos >= 360 && minutos <= 1140;
    }
});
