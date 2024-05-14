

document.addEventListener('DOMContentLoaded', function () {
    axios.get('/get-transactions')
        .then(response => {
            const transactions = response.data;
            const table = document.getElementById('transactionsList');
            transactions.forEach(t => {
                const row = table.insertRow();
                row.insertCell(0).textContent = t.categoria;
                row.insertCell(1).textContent = t.tipo;
                row.insertCell(2).textContent = `R$ ${parseFloat(t.valor).toFixed(2)}`;

            });
            updateTotals();  // Assegure-se de que essa função esteja definida para calcular totais
        })
        .catch(error => {
            console.error('Erro ao carregar transações:', error);
        });
});
document.addEventListener('DOMContentLoaded', function () {
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith('username='));
    if (cookieValue) {
        const username = decodeURIComponent(cookieValue.split('=')[1]);
        document.getElementById('username').textContent = username;
    } else {
        document.getElementById('username').textContent = 'Usuário não identificado';
    }
});

function addToTable(categoria, tipo, valor) {
    const table = document.getElementById('transactionsList');
    const row = table.insertRow();
    row.insertCell(0).textContent = categoria;
    row.insertCell(1).textContent = tipo;
    row.insertCell(2).textContent = `R$ ${valor.toFixed(2)}`;
    updateTotals();
}

function updateTotals() {
    const rows = document.querySelectorAll('#transactionsList tr');
    let totalReceitas = 0;
    let totalDespesas = 0;
    rows.forEach(row => {
        const tipo = row.cells[1].textContent;
        const valor = parseFloat(row.cells[2].textContent.replace('R$ ', ''));
        if (tipo === 'Receita') {
            totalReceitas += valor;
        } else {
            totalDespesas += valor;
        }
    });
    document.getElementById('totalReceitas').textContent = `R$ ${totalReceitas.toFixed(2)}`;
    document.getElementById('totalDespesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;
    document.getElementById('saldoFinal').textContent = `R$ ${(totalReceitas - totalDespesas).toFixed(2)}`;
}

// Configuração inicial do Toast
const toastEl = document.getElementById('toastMessage');
const toast = new bootstrap.Toast(toastEl, {
    autohide: true,
    delay: 5000  // Toast desaparece após 5 segundos
});

// Função para mostrar toasts
function showToast(message) {
    toastEl.querySelector('.toast-body').textContent = message;
    toast.show();
}

// Adicionar receita
document.getElementById('formReceita').addEventListener('submit', function (event) {
    event.preventDefault();
    const tipo = document.getElementById('tipoReceita');
    const valor = parseFloat(document.getElementById('valorReceita').value);
    if (tipo.value === "") {
        tipo.setCustomValidity("Por favor, selecione o tipo de receita.");
    } else {
        tipo.setCustomValidity(""); // Limpa a mensagem de validação se tudo estiver correto
    }
    if (!this.checkValidity()) {
        this.reportValidity(); // Mostra a mensagem de validação
        return;
    }
    axios.post('/add-transaction', { tipo: 'Receita', categoria: tipo.value, valor: valor })
        .then(function (response) {
            showToast('Receita adicionada com sucesso!');
            $('#modalReceita').modal('hide');
            addToTable(tipo.value, 'Receita', valor);
        })
        .catch(function (error) {
            showToast('Erro ao adicionar receita: ' + (error.response ? error.response.data : 'Erro desconhecido'));
        });
});

document.getElementById('formDespesa').addEventListener('submit', function (event) {
    event.preventDefault();
    const tipo = document.getElementById('tipoDespesa');
    const valor = parseFloat(document.getElementById('valorDespesa').value);
    if (tipo.value === "") {
        tipo.setCustomValidity("Por favor, selecione o tipo de despesa.");
    } else {
        tipo.setCustomValidity("");
    }
    if (!this.checkValidity()) {
        this.reportValidity();
        return;
    }
    axios.post('/add-transaction', { tipo: 'Despesa', categoria: tipo.value, valor: valor })
        .then(function (response) {
            showToast('Despesa adicionada com sucesso!');
            $('#modalDespesa').modal('hide');
            addToTable(tipo.value, 'Despesa', valor);
        })
        .catch(function (error) {
            showToast('Erro ao adicionar despesa: ' + (error.response ? error.response.data : 'Erro desconhecido'));
        });
});


// Limpar campos ao abrir os modais
$('#modalReceita, #modalDespesa').on('show.bs.modal', function (event) {
    this.querySelector('select').value = ""; // Reseleciona o placeholder
    this.querySelector('input[type="number"]').value = ""; // Limpa o campo de valor
});

