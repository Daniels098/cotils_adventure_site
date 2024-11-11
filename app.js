const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const connectDB = require('./src/db.js');
const path = require('path');
const userRoutes = require('./src/routes/userRoutes.js');
const app = express();
const PlayerData = require('./src/models/PlayerData.js');
const PlayerCredentials = require('./src/models/PlayerCredentials.js');
require("dotenv").config();

// Configuração do middleware
app.use(express.json());
app.use('/user', userRoutes);

// Configuração do EJS
app.set('views', path.join(__dirname, 'src/views')); // Define o diretório de views
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'src', 'public')));

// Conectar ao MongoDB
connectDB();

// Configuração da session
app.use(session({
  secret: process.env.SECRET_KEY, 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Deve ser true se estiver em HTTPS
}));


// Rota para a página inicial
app.get('/', (req, res) => {
  res.render('layout', { title: 'Cotil\'s Adventure', content: 'index' });
});

// Página de login
app.get('/login', (req, res) => {
  res.render('layout', { title: 'Cotil\'s Adventure', content: 'login' });
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const player = await PlayerCredentials.findOne({ username });
    if (!player) {
      return res.status(404).send({ error: "Jogador não encontrado!" });
    }

    if (player.password !== password) {
      return res.status(401).send({ error: "Senha incorreta!" });
    }

    req.session.username = player.username;  // Salva o username na sessão
    res.redirect('/');  // Redireciona para a página inicial após o login
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Erro no login." });
  }
});

// Página para baixar o jogo
app.get('/download', (req, res) => {
  res.render('layout', { title: 'Cotil\'s Adventure', content: 'download' });
});

// Página com galeria de fotos do jogo
app.get('/destaque', (req, res) => {
  res.render('layout', { title: 'Cotil\'s Adventure', content: 'destaque' });
});

// Página sobre o projeto TCC e os integrantes
app.get('/sobre', (req, res) => {
  res.render('layout', { title: 'Cotil\'s Adventure', content: 'sobre' });
});

module.exports = app;

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
