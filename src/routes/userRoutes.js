const express = require('express');
const router = express.Router();
const PlayerData = require('../models/PlayerData.js');
const PlayerCredentials = require('../models/PlayerCredentials.js');

// Rota para retornar os dados do jogador (sem download, apenas renderiza na página)
router.get('/get_player_data/:username', async (req, res) => {
  try {
    // Busca os dados do jogador e as credenciais pelo username
    const playerData = await PlayerData.findOne({ username: req.params.username });
    const credential = await PlayerCredentials.findOne({ username: req.params.username });

    if (!credential) {
      return res.status(404).send({ error: "Credencial não encontrada." });
    }
    if (!playerData) {
      return res.status(404).send({ error: "Dados do jogador não encontrados." });
    }

    // Renderiza a página profile com os dados do jogador
    res.render('profile', { playerData, credential });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao buscar dados do jogador.");
  }
});


module.exports = router;
