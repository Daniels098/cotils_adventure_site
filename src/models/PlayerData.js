const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define o esquema para os dados do jogador
const playerDataSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    scene: {
        type: String,
        default: null
    },
    device: {
        type: String,
        default: null
    },
    inventory: [
        {
            amount: {
                type: Number,
                default: 0
            },
            item_name: {
                type: String,
                default: ""
            }
        }
    ],
    position: {
        x: {
            type: Number,
            default: 0
        },
        y: {
            type: Number,
            default: 0
        }
    },
    missions: {
        missions_available: {
            type: [String],
            default: []
        },
        missions_active: {
            type: [String],
            default: []
        },
        missions_completed: {
            type: [String],
            default: []
        }
    }
});

// Exporta o modelo player_data
module.exports = mongoose.model('PlayerData', playerDataSchema);