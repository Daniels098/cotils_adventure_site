const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.render('profile', { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao obter dados do usuário");
  }
});

module.exports = router;
