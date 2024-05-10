const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Caminho para o arquivo JSON que armazena as transações
const DATA_FILE = path.join(__dirname, 'transactions.json');

// Inicializa o arquivo de transações se não existir
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ transacoes: [] }));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuração das sessões
app.use(session({
    secret: 'segredo muito secreto',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

let usuarios = [];

// Rota para servir as páginas estáticas de login e registro
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

// Endpoint para login e registro de usuários
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    if (usuario) {
        req.session.user = usuario; // Armazena usuário na sessão
        res.redirect('/calculate');
    } else {
        res.status(401).send('Credenciais inválidas.');
    }
});

app.post('/register', (req, res) => {
    const { nome, email, senha } = req.body;
    if (usuarios.some(u => u.email === email)) {
        return res.status(400).send('Email já cadastrado.');
    }
    const novoUsuario = { id: usuarios.length + 1, nome, email, senha };
    usuarios.push(novoUsuario);
    req.session.user = novoUsuario; // Inicia sessão após o registro
    res.redirect('/calculate');
});

// Rota para servir a página de cálculo e mostrar o nome do usuário
app.get('/calculate', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.cookie('username', req.session.user.nome, { httpOnly: false });
    res.sendFile(path.join(__dirname, 'public', 'calculate.html'));
});

// Endpoint para adicionar transações de receitas e despesas
app.post('/add-transaction', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado.');
    }

    const { tipo, categoria, valor } = req.body;
    const transacao = { tipo, categoria, valor, usuarioId: req.session.user.id, data: new Date().toISOString() };
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    data.transacoes.push(transacao);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data), 'utf8');
    res.send('Transação adicionada com sucesso!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/login`);
});
