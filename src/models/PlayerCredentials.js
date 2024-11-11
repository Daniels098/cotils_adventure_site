const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define o esquema para as credenciais do jogador
const playerCredentialsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// Exporta o modelo PlayerCredentials
module.exports = mongoose.model('PlayerCredentials', playerCredentialsSchema);
