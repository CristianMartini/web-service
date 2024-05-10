const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuração das sessões
app.use(session({
    secret: 'segredo muito secreto',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // use 'secure: true' apenas se estiver usando HTTPS
}));

let usuarios = [];

// Rota para servir a página de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Rota para servir a página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/calculate', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    // Garanta que o cookie não está marcado como HttpOnly se você precisa lê-lo com JavaScript
    res.cookie('username', req.session.user.nome, { httpOnly: false }); // Remova 'httpOnly' se quiser acessar via JS
    res.sendFile(path.join(__dirname, 'public', 'calculate.html'));
});


// Endpoint para login de usuários
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    if (usuario) {
        req.session.user = usuario; // Armazena usuário na sessão
        res.redirect('/calculate');
    } else {
        res.status(401).send('Credenciais inválidas. Registre-se');
    }
});
// Endpoint para registrar um usuário
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
// Endpoint para login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    if (usuario) {
        req.session.user = usuario;
        console.log('Usuário logado:', req.session.user); // Adiciona um log para depuração
        res.redirect('/calculate');
    } else {
        res.status(401).send('Credenciais inválidas.');
    }
});

// Endpoint para registro
app.post('/register', (req, res) => {
    const { nome, email, senha } = req.body;
    if (usuarios.some(u => u.email === email)) {
        return res.status(400).send('Email já cadastrado.');
    }
    const novoUsuario = { id: usuarios.length + 1, nome, email, senha };
    usuarios.push(novoUsuario);
    req.session.user = novoUsuario;
    console.log('Usuário registrado e logado:', req.session.user); // Adiciona um log para depuração
    res.redirect('/calculate');
});


// Rota para servir a página de cálculo (somente para usuários autenticados)
app.get('/calculate', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redireciona para login se não estiver autenticado
    }
    const options = {
        root: path.join(__dirname, 'public')
    };
    res.cookie('username', req.session.user.nome); // Opcional: envia o nome do usuário via cookie
    res.sendFile('calculate.html', options);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/login`);
});
