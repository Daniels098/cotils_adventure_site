const express = require('express')
const mongoose = require('mongoose')
const app = express()
app.use(express.json())
require("dotenv").config();

// Default Schema
const schema_data = new mongoose.Schema({
    username: { type: String, ref: 'PlayerCredentials' },
    scene: String,
    device: String,
    inventory: [{
        amount: Number,
        item_name: String,
        _id: false
    }],
    position: {
    x: Number,
    y: Number,
  },
  missions: {
    missions_available: Array,
    missions_active: Array,
    missions_completed: Array
  },
});

const playerCredentialsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true }, // O email deve ser único
    password: { type: String, required: true } // Lembre-se de criptografar senhas na produção!
});

const PlayerCredentials = mongoose.model('PlayerCredentials', playerCredentialsSchema)
const player_data = mongoose.model('DataPlayer', schema_data)

app.get('/', (req, res) => {
    res.send('API is running');
});

// Registrar
app.post("/register", async (req, res) => {
  try {
      // Cria um novo usuário em PlayerCredentials
      const credential = await PlayerCredentials.create({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password
      });

      // Cria o documento do jogador em player_data, referenciando o username de PlayerCredentials
      const playerData = await player_data.create({
          username: credential.username,
          scene: req.body.scene || null,
          device: req.body.device || null,
          inventory: req.body.inventory ? req.body.inventory.map(item => ({
              amount: item.amount,
              item_name: item.item_name
          })) : [], // Inventory vazio caso não esteja disponível
          position: req.body.position ? {
              x: req.body.position.x,
              y: req.body.position.y
          } : { x: 0, y: 0 }, // Posição padrão caso não esteja disponível
          missions: {
              missions_available: req.body.missions?.missions_available || [],
              missions_active: req.body.missions?.missions_active || [],
              missions_completed: req.body.missions?.missions_completed || []
          }
      });

      return res.status(201).send({ credential, playerData });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({ error: "Username já está em uso." });
    }
    console.error(error);
    return res.status(500).send({ error: "Erro ao registrar o usuário." });
  }
});


// Login
app.post("/login", async (req, res) => {
  try {
      const { username, password } = req.body;

      // Busca o jogador pelo username
      const player = await PlayerCredentials.findOne({ username });
      if (!player) {
          return res.status(404).send({ error: "Jogador não encontrado!" });
      }

      // Verifique a senha
      if (player.password !== password) {
          return res.status(401).send({ error: "Senha incorreta!" });
      }

      // Busca os dados do jogador na coleção player_data usando o username
      const playerData = await player_data.findOne({ username: player.username });
      if (!playerData) {
          return res.status(404).send({ error: "Dados do jogador não encontrados." });
      }

      return res.status(200).send({ playerData, credential: player });
  } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Erro no login." });
  }
});


// Uso para testes
app.get("/get_credentials/:username", async (req, res) => {
    try {
      const credential = await PlayerCredentials.findOne({ username: req.params.username });  // Busca pelo username
      if (!credential) {
        return res.status(404).send({ error: "Credencial não encontrada." });
      }
      return res.status(200).send(credential);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Erro ao buscar a credencial." });
    }
});

// Uso para testes
app.get("/get_all_credentials", async (req, res) => {
  try {
    const credentials = await PlayerCredentials.find();  // Busca todas as credenciais
    return res.status(200).send(credentials);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Erro ao buscar as credenciais." });
  }
});

// Atualizar o save game com base no Username
app.put("/updateData", async (req, res) => {
  try {
      if (!req.body.username) {
          return res.status(400).send("Username é obrigatório.");
      }

      const playerData = await player_data.findOneAndUpdate(
          { username: req.body.username },
          {
              scene: req.body.scene || "",
              device: req.body.device || "",
              inventory: req.body.inventory ? req.body.inventory.map(item => ({
                  amount: item.amount,
                  item_name: item.item_name
              })) : [],
              position: req.body.position ? {
                  x: req.body.position.x,
                  y: req.body.position.y
              } : { x: 0, y: 0 },
              missions: {
                  missions_available: req.body.missions?.missions_available || [],
                  missions_active: req.body.missions?.missions_active || [],
                  missions_completed: req.body.missions?.missions_completed || []
              }
          },
          { new: true }
      );

      if (!playerData) {
          return res.status(404).send({ error: "Dados do jogador não encontrados." });
      }

      return res.status(200).send({ message: "Dados atualizados com sucesso!", playerData });
  } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Erro ao atualizar os dados." });
  }
});


// Para retornar o save game do usuário
app.get("/get_player_data/:username", async (req, res) => {
  try {
    // Busca os dados do jogador diretamente usando o username
    const playerData = await player_data.findOne({ username: req.params.username });
    
    const credential = await PlayerCredentials.findOne({ username: req.params.username });
    
    if (!credential) {
      return res.status(404).send({ error: "Credencial não encontrada." });
    }
    if (!playerData) {
      return res.status(404).send({ error: "Dados do jogador não encontrados." });
    }

    res.status(200).send({ playerData });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Erro ao buscar dados do jogador." });
  }
});

// Uso para testes
app.get("/get_all_players", async (req, res) => {
  try {
    const allPlayers = await player_data.find({}); // Busca todos os jogadores

    if (allPlayers.length === 0) {
      return res.status(404).send({ error: "Nenhum jogador encontrado." });
    }

    return res.status(200).send(allPlayers); // Retorna a lista de todos os jogadores
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Erro ao buscar os jogadores." });
  }
});

// Uso para testes talvez
app.delete("/deleteById/:id", async(req,res) => {
    const data = await player_data.findByIdAndDelete(req.params.id)
    return res.send(data)
})

// Link do MongoDB
app.listen(process.env.PORT, () => {
    mongoose.connect(process.env.DB_URI)
    console.log('Banco de dados conectado')
})