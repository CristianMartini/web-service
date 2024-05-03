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

// Rota para servir a página de cálculo (somente para usuários autenticados)
app.get('/calculate', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redireciona para login se não estiver autenticado
    }
    res.sendFile(path.join(__dirname, 'public', 'calculate.html'));
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

// Endpoint para login de usuários
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    if (usuario) {
        req.session.user = usuario;
        res.redirect('/calculate');
    } else {
        res.status(401).send('Credenciais inválidas. Registre-se');
    }

});
// Endpoint para cálculo da equação do segundo grau
app.post('/calculate', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado.'); // Verifica se o usuário está logado
    }
    const { a, b, c } = req.body;
    if (a == 0) { // Verifica se 'a' é zero, pois não pode ser zero em uma equação de segundo grau
        return res.send("O coeficiente 'a' não pode ser zero.");
    }
    const delta = b * b - 4 * a * c;
    if (delta < 0) {
        res.send('Não existem raízes reais.');
    } else {
        const raiz1 = (-b + Math.sqrt(delta)) / (2 * a);
        const raiz2 = (-b - Math.sqrt(delta)) / (2 * a);
        res.send({ raiz1, raiz2 });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
