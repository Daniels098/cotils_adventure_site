const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("MongoDB Atlas conectado com sucesso");
  } catch (err) {
    console.error("Erro ao conectar com o MongoDB", err);
    process.exit(1);
  }
};

module.exports = connectDB;
