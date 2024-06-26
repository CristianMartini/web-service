const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;
const TRANSACTION_DATA_FILE = path.join(__dirname, 'transactions.json');
const USER_DATA_FILE = path.join(__dirname, 'users.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'segredo muito secreto',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Inicializa os arquivos de dados se não existirem
function initDataFile(filePath, defaultData) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData), 'utf8');
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const transactionsData = initDataFile(TRANSACTION_DATA_FILE, { transacoes: [] });
let usersData = initDataFile(USER_DATA_FILE, { usuarios: [] });

app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (usersData.usuarios.some(u => u.email === email)) {
        return res.status(400).send('Email já cadastrado.');
    }
    const hashedPassword = await bcrypt.hash(senha, 10);
    const novoUsuario = { id: usersData.usuarios.length + 1, nome, email, senha: hashedPassword };
    usersData.usuarios.push(novoUsuario);
    fs.writeFileSync(USER_DATA_FILE, JSON.stringify(usersData), 'utf8');
    req.session.user = novoUsuario;
    res.redirect('/calculate');
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const usuario = usersData.usuarios.find(u => u.email === email);
    if (usuario && await bcrypt.compare(senha, usuario.senha)) {
        req.session.user = usuario;
        res.redirect('/calculate');
    } else {
        res.status(401).send('Credenciais inválidas ou usuário não registrado.');
    }
});

app.get('/calculate', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.cookie('username', req.session.user.nome, { httpOnly: false });
    res.sendFile(path.join(__dirname, 'public', 'calculate.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Falha ao deslogar');
        }
        res.redirect('/login');
    });
});

app.get('/get-transactions', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado.');
    }
    const data = JSON.parse(fs.readFileSync(TRANSACTION_DATA_FILE, 'utf8'));
    const transacoesUsuario = data.transacoes.filter(t => t.usuarioId === req.session.user.id);
    res.json(transacoesUsuario);
});

app.post('/add-transaction', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado.');
    }
    const { tipo, categoria, valor } = req.body;
    const transacao = { tipo, categoria, valor, usuarioId: req.session.user.id, data: new Date().toISOString() };
    const data = JSON.parse(fs.readFileSync(TRANSACTION_DATA_FILE, 'utf8'));
    data.transacoes.push(transacao);
    fs.writeFileSync(TRANSACTION_DATA_FILE, JSON.stringify(data), 'utf8');
    res.send('Transação adicionada com sucesso!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/login`);
});
