// Handler serverless da Vercel que reutiliza o app principal
let app;

try {
  const main = require("../app");
  app = main.app;
  console.log("✅ App carregado para serverless");
} catch (error) {
  console.error("❌ Erro ao carregar app.js:", error.message);
  app = (req, res) => {
    res.status(500).json({ error: "Erro ao inicializar o servidor" });
  };
}

module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error("❌ Erro no handler:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};
