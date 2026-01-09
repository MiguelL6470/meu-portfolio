// Script para inicialização das tabelas no Neon DB
require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

// async function initializeDatabase() {
//   try {
//     console.log("🔄 Iniciando criação das tabelas...");

//     // Criar tabela de usuários (administradores)
//     await sql`
//       CREATE TABLE IF NOT EXISTS usuarios (
//         id SERIAL PRIMARY KEY,
//         username VARCHAR(50) UNIQUE NOT NULL,
//         email VARCHAR(100) UNIQUE NOT NULL,
//         password_hash VARCHAR(255) NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `;
//     console.log("✅ Tabela 'usuarios' criada/verificada");

//     // Criar tabela de projetos
//     await sql`
//       CREATE TABLE IF NOT EXISTS projetos (
//         id SERIAL PRIMARY KEY,
//         titulo VARCHAR(200) NOT NULL,
//         descricao TEXT NOT NULL,
//         tecnologias VARCHAR(500),
//         github_url VARCHAR(500),
//         demo_url VARCHAR(500),
//         imagem_url VARCHAR(500),
//         destaque BOOLEAN DEFAULT false,
//         ativo BOOLEAN DEFAULT true,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `;
//     console.log("✅ Tabela 'projetos' criada/verificada");

//     // Criar tabela de sessões
//     await sql`
//       CREATE TABLE IF NOT EXISTS sessoes (
//         session_id VARCHAR(255) PRIMARY KEY,
//         usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         expires_at TIMESTAMP NOT NULL
//       )
//     `;
//     console.log("✅ Tabela 'sessoes' criada/verificada");

//     // Criar tabela de configurações do site
//     await sql`
//       CREATE TABLE IF NOT EXISTS site_settings (
//         id SERIAL PRIMARY KEY,
//         setting_key VARCHAR(100) UNIQUE NOT NULL,
//         setting_value TEXT,
//         setting_type VARCHAR(50) DEFAULT 'text',
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_by INTEGER REFERENCES usuarios(id)
//       )
//     `;
//     console.log("✅ Tabela 'site_settings' criada/verificada");

//     // Criar tabela de conteúdo editável do site
//     await sql`
//       CREATE TABLE IF NOT EXISTS site_content (
//         id SERIAL PRIMARY KEY,
//         section_name VARCHAR(100) NOT NULL,
//         content_key VARCHAR(100) NOT NULL,
//         content_value TEXT,
//         content_type VARCHAR(50) DEFAULT 'text',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         UNIQUE(section_name, content_key)
//       )
//     `;
//     console.log("✅ Tabela 'site_content' criada/verificada");

//     // Criar tabela de uploads
//     await sql`
//       CREATE TABLE IF NOT EXISTS uploads (
//         id SERIAL PRIMARY KEY,
//         filename VARCHAR(255) NOT NULL,
//         original_name VARCHAR(255) NOT NULL,
//         file_path VARCHAR(500) NOT NULL,
//         file_size INTEGER,
//         mime_type VARCHAR(100),
//         alt_text VARCHAR(255),
//         uploaded_by INTEGER REFERENCES usuarios(id),
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `;
//     console.log("✅ Tabela 'uploads' criada/verificada");

//     // Criar tabela de analytics de visitas
//     await sql`
//       CREATE TABLE IF NOT EXISTS analytics_visits (
//         id SERIAL PRIMARY KEY,
//         visitor_ip VARCHAR(45),
//         user_agent TEXT,
//         page_visited VARCHAR(500),
//         referrer VARCHAR(500),
//         country VARCHAR(100),
//         device_type VARCHAR(50),
//         browser VARCHAR(100),
//         visit_duration INTEGER DEFAULT 0,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `;
//     console.log("✅ Tabela 'analytics_visits' criada/verificada");

//     // Criar tabela de visitantes online
//     await sql`
//       CREATE TABLE IF NOT EXISTS online_visitors (
//         id SERIAL PRIMARY KEY,
//         session_id VARCHAR(255) UNIQUE NOT NULL,
//         visitor_ip VARCHAR(45),
//         current_page VARCHAR(500),
//         user_agent TEXT,
//         last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `;
//     console.log("✅ Tabela 'online_visitors' criada/verificada");

//     // Criar tabela de mensagens de contato
//     await sql`
//       CREATE TABLE IF NOT EXISTS contact_messages (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         email VARCHAR(255) NOT NULL,
//         subject VARCHAR(255),
//         message TEXT NOT NULL,
//         status VARCHAR(50) DEFAULT 'unread',
//         replied BOOLEAN DEFAULT false,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         read_at TIMESTAMP,
//         replied_at TIMESTAMP
//       )
//     `;
//     console.log("✅ Tabela 'contact_messages' criada/verificada");

//     // Criar tabela de depoimentos/testimonials
//     await sql`
//       CREATE TABLE IF NOT EXISTS testimonials (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         company VARCHAR(255),
//         position VARCHAR(255),
//         message TEXT NOT NULL,
//         avatar_url VARCHAR(500),
//         rating INTEGER DEFAULT 5,
//         active BOOLEAN DEFAULT true,
//         order_position INTEGER DEFAULT 0,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `;
//     console.log("✅ Tabela 'testimonials' criada/verificada");

//     // Criar usuário admin padrão se não existir
//     const existingUser = await sql`
//       SELECT id FROM usuarios WHERE username = 'admin'
//     `;

//     if (existingUser.length === 0) {
//       const bcrypt = require('bcryptjs');
//       const hashedPassword = await bcrypt.hash('admin123', 10);
      
//       await sql`
//         INSERT INTO usuarios (username, email, password_hash)
//         VALUES ('admin', 'admin@portfolio.local', ${hashedPassword})
//       `;
//       console.log("✅ Usuário admin padrão criado (username: admin, password: admin123)");
//       console.log("⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!");
//     }

//     // Inserir configurações padrão do site
//     const defaultSettings = [
//       { key: 'site_title', value: 'Meu Portfólio | Desenvolvedor', type: 'text' },
//       { key: 'site_description', value: 'Portfólio profissional - Desenvolvedor disponível para freelances e contratos', type: 'text' },
//       { key: 'main_email', value: 'seu-email@exemplo.com', type: 'email' },
//       { key: 'github_url', value: 'https://github.com/seu-usuario', type: 'url' },
//       { key: 'linkedin_url', value: 'https://linkedin.com/in/seu-perfil', type: 'url' },
//       { key: 'maintenance_mode', value: 'false', type: 'boolean' },
//       { key: 'analytics_enabled', value: 'true', type: 'boolean' },
//       { key: 'theme_primary_color', value: '#667eea', type: 'color' },
//       { key: 'theme_secondary_color', value: '#764ba2', type: 'color' }
//     ];

//     for (const setting of defaultSettings) {
//       await sql`
//         INSERT INTO site_settings (setting_key, setting_value, setting_type)
//         VALUES (${setting.key}, ${setting.value}, ${setting.type})
//         ON CONFLICT (setting_key) DO NOTHING
//       `;
//     }
//     console.log("✅ Configurações padrão do site inseridas");

//     // Inserir conteúdo padrão do site
//     const defaultContent = [
//       // Hero Section
//       { section: 'hero', key: 'title', value: 'Olá, eu sou Desenvolvedor', type: 'text' },
//       { section: 'hero', key: 'subtitle', value: 'Especializado em desenvolvimento web fullstack, criando soluções digitais modernas e funcionais', type: 'text' },
//       { section: 'hero', key: 'cta_primary', value: 'Ver Projetos', type: 'text' },
//       { section: 'hero', key: 'cta_secondary', value: 'Entre em Contato', type: 'text' },
      
//       // About Section
//       { section: 'about', key: 'title', value: 'Sobre Mim', type: 'text' },
//       { section: 'about', key: 'paragraph1', value: 'Sou um desenvolvedor apaixonado por tecnologia, sempre em busca de criar soluções inovadoras e eficientes. Com experiência em desenvolvimento web fullstack, trabalho com as mais modernas tecnologias do mercado.', type: 'textarea' },
//       { section: 'about', key: 'paragraph2', value: 'Estou disponível para freelances e contratos, oferecendo serviços de qualidade e comprometimento com prazos e resultados.', type: 'textarea' },
//       { section: 'about', key: 'skills', value: 'JavaScript,Node.js,React,HTML/CSS,PostgreSQL,Express,Git', type: 'text' },
      
//       // Contact Section
//       { section: 'contact', key: 'title', value: 'Entre em Contato', type: 'text' },
//       { section: 'contact', key: 'subtitle', value: 'Vamos trabalhar juntos!', type: 'text' },
//       { section: 'contact', key: 'description', value: 'Estou sempre aberto a novos desafios e oportunidades. Se você tem um projeto em mente ou precisa de um desenvolvedor, não hesite em entrar em contato.', type: 'textarea' },
      
//       // Footer
//       { section: 'footer', key: 'copyright', value: '2024 Meu Portfólio. Desenvolvido com ❤️', type: 'text' }
//     ];

//     for (const content of defaultContent) {
//       await sql`
//         INSERT INTO site_content (section_name, content_key, content_value, content_type)
//         VALUES (${content.section}, ${content.key}, ${content.value}, ${content.type})
//         ON CONFLICT (section_name, content_key) DO NOTHING
//       `;
//     }
//     console.log("✅ Conteúdo padrão do site inserido");

//     console.log("🎉 Database inicializado com sucesso!");
    
//   } catch (error) {
//     console.error("❌ Erro ao inicializar o database:", error);
//     process.exit(1);
//   }
// }

// // Executar se chamado diretamente
// if (require.main === module) {
//   initializeDatabase();
// }

// module.exports = { initializeDatabase };