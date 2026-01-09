#!/usr/bin/env node
require("dotenv").config();

const { startServer } = require('./app');
const { initializeDatabase } = require('./scripts/init-db');

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const initDb = args.includes('--init-db');

async function main() {
  try {
    console.log("🚀 Inicializando Portfolio...");
    
    // Verificar variáveis de ambiente necessárias
    if (!process.env.DATABASE_URL) {
      console.error("❌ Erro: DATABASE_URL não encontrada no arquivo .env");
      process.exit(1);
    }

    // Inicializar banco de dados se solicitado
    if (initDb) {
      console.log("🔄 Inicializando banco de dados...");
      await initializeDatabase();
    }

    // Configurar ambiente
    if (isDev) {
      console.log("🔧 Modo de desenvolvimento ativo");
      process.env.NODE_ENV = 'development';
    } else {
      console.log("🏭 Modo de produção ativo");
      process.env.NODE_ENV = 'production';
    }

    // Iniciar o servidor
    console.log("⚡ Iniciando servidor...");
    startServer();

    // Tratamento de sinais para graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error("❌ Erro ao inicializar a aplicação:", error);
    process.exit(1);
  }
}

function gracefulShutdown(signal) {
  console.log(`\n📴 Recebido sinal ${signal}. Desligando servidor...`);
  
  // Aqui você pode adicionar lógica de cleanup se necessário
  // Por exemplo: fechar conexões de banco, finalizar tasks, etc.
  
  console.log("✅ Servidor desligado com sucesso!");
  process.exit(0);
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Executar função principal
if (require.main === module) {
  main();
} 