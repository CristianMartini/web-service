document.addEventListener('DOMContentLoaded', function () {
    axios.get('/get-transactions')
        .then(response => {
            const transactions = response.data;
            const table = document.getElementById('transactionsList');
            transactions.forEach(t => {
                addToTable(t.tipo, t.categoria, t.valor, t.data);
            });
            updateTotals();
        })
        .catch(error => {
            console.error('Erro ao carregar transações:', error);
        });

    const cookieValue = document.cookie.split('; ').find(row => row.startsWith('username='));
    if (cookieValue) {
        const username = decodeURIComponent(cookieValue.split('=')[1]);
        document.getElementById('username').textContent = username;
    } else {
        document.getElementById('username').textContent = 'Usuário não identificado';
    }
});

function addToTable(tipo, categoria, valor, data) {
    const table = document.getElementById('transactionsList');
    const row = table.insertRow();
    row.insertCell(0).textContent = tipo; // Tipo
    row.insertCell(1).textContent = categoria; // Categoria
    // Corrigindo a exibição da data
    const dataCorrigida = new Date(data);
    dataCorrigida.setMinutes(dataCorrigida.getMinutes() + dataCorrigida.getTimezoneOffset());
    row.insertCell(2).textContent = dataCorrigida.toLocaleDateString('pt-BR'); // Exibindo data corrigida

    row.insertCell(3).textContent = `R$ ${parseFloat(valor).toFixed(2)}`; // Valor (R$)
    updateTotals();
}

function updateTotals() {
    const rows = document.querySelectorAll('#transactionsList tr');
    let totalReceitas = 0;
    let totalDespesas = 0;
    rows.forEach(row => {
        const tipo = row.cells[0].textContent;  // Tipo está na primeira célula
        const valor = parseFloat(row.cells[3].textContent.replace('R$ ', ''));  // Valor está na quarta célula
        if (tipo === 'Receita') {
            totalReceitas += valor;
        } else if (tipo === 'Despesa') {
            totalDespesas += valor;
        }
    });
    document.getElementById('totalReceitas').textContent = `R$ ${totalReceitas.toFixed(2)}`;
    document.getElementById('totalDespesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;
    document.getElementById('saldoFinal').textContent = `R$ ${(totalReceitas - totalDespesas).toFixed(2)}`;
}

// Adicionar receita

document.getElementById('formReceita').addEventListener('submit', function (event) {
    event.preventDefault();
    const tipo = document.getElementById('tipoReceita').value;
    const valor = parseFloat(document.getElementById('valorReceita').value);
    const data = document.getElementById('dataReceita').value;
    axios.post('/add-transaction', { tipo: 'Receita', categoria: tipo, valor, data })
        .then(response => {
            addToTable('Receita', tipo, valor, data);
            $('#modalReceita').modal('hide');
            showToast('Receita adicionada com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao adicionar receita:', error);
            showToast('Erro ao adicionar receita: ' + (error.response ? error.response.data : 'Erro desconhecido'));
        });

});

document.getElementById('formDespesa').addEventListener('submit', function (event) {
    event.preventDefault();
    const tipo = document.getElementById('tipoDespesa').value;
    const valor = parseFloat(document.getElementById('valorDespesa').value);
    const data = document.getElementById('dataDespesa').value;
    axios.post('/add-transaction', { tipo: 'Despesa', categoria: tipo, valor, data })
        .then(function (response) {
            showToast('Despesa adicionada com sucesso!');
            $('#modalDespesa').modal('hide');
            addToTable('Despesa', tipo, valor, data);
        })
        .catch(function (error) {
            showToast('Erro ao adicionar despesa: ' + (error.response ? error.response.data : 'Erro desconhecido'));
        });
});



// Configuração inicial do Toast
document.addEventListener('DOMContentLoaded', function () {
    const toastEl = document.getElementById('toastMessage');
    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 5000
    });

    window.showToast = function (message) {
        toastEl.querySelector('.toast-body').textContent = message;
        toast.show();
    }
});

// Limpar campos ao abrir os modais
$('#modalReceita, #modalDespesa').on('show.bs.modal', function (event) {
    this.querySelector('select').value = ""; // Reseleciona o placeholder
    this.querySelector('input[type="number"]').value = ""; // Limpa o campo de valor
    this.querySelector('input[type="date"]').value = ""; // Limpa o campo de data
});
