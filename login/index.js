const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware para permitir o uso de JSON nas requisições

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
const usuarios = [
    { id: 1, nome: 'UsuarioTeste', email: 'usuario@teste.com', senha: 'senha123' }
];




// Rota GET para exibir a página de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Rota POST para processar o registro do usuário
app.post('/register', (req, res) => {
    const { nome, email, senha } = req.body;

    // Verifica se o email já está sendo usado por outro usuário
    const emailExistente = usuarios.some(u => u.email === email);
    if (emailExistente) {
        return res.status(400).send('O email já está em uso');
    }

    // Cria um novo usuário
    const novoUsuario = {
        nome: nome,
        email: email,
        senha: senha
    };

    // Adiciona o novo usuário ao array de usuários
    usuarios.push(novoUsuario);

    // Redireciona para a página de sucesso após o registro
    res.redirect('/sucesso.html');
});




// Rota GET para exibir a página de login

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Procurar o usuário pelo email
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const usuario = usuarios.find(u => u.email === email);
    
    // Se as credenciais estiverem corretas, redirecionar para página de sucesso
    if (!usuario || usuario.senha !== senha) {
        return res.status(401).send('Credenciais inválidas');
    }
    res.redirect('/sucesso.html');
});

// Inicia o servidor

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
