const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 8080;

// Define o diretório público para arquivos estáticos (como a página HTML)
app.use(express.static('public'));

// Rota para consultar o CEP
app.get('/api/cep/:cep', async (req, res) => {
  try {
    const { cep } = req.params;
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const response = await axios.get(url);
    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error('Erro ao fazer solicitação para API CEP:', error);
    res.status(500).json({ error: 'Erro ao obter dados da API CEP' });
  }
});

// Rota padrão para servir a página HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
