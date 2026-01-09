// Vercel Serverless Function Handler
// Wrapper global para capturar qualquer erro durante a inicialização
let app;

try {
  // Carregar variáveis de ambiente
  try {
    require("dotenv").config();
  } catch (error) {
    console.warn('Aviso: dotenv não carregado (normal no Vercel)');
  }

  const express = require("express");
  const cors = require("cors");
  const helmet = require("helmet");
  const session = require("express-session");
  const path = require("path");
  const multer = require("multer");
  const fs = require("fs").promises;
  const { neon } = require("@neondatabase/serverless");

  // Auth module - stubbed for public repository
  const auth = {
    requireAuth: (req, res, next) => { return res.status(404).json({ error: 'Not found' }); },
    authenticateUser: async () => null,
    isIpBlocked: () => false,
    recordLoginAttempt: () => {},
    getRemainingAttempts: () => 5
  };

  app = express();

// Log inicial para debug
console.log('🚀 Inicializando handler do Vercel...');
console.log('NODE_ENV:', process.env.NODE_ENV || 'não definido');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ Não configurada');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Configurada' : '⚠️ Usando padrão inseguro');

// Configurar banco de dados com tratamento de erro
let sql;
try {
  if (process.env.DATABASE_URL) {
    console.log('✅ Conectando ao banco de dados...');
    sql = neon(process.env.DATABASE_URL);
    console.log('✅ Banco de dados configurado');
  } else {
    console.warn('⚠️ DATABASE_URL não configurada. Algumas funcionalidades podem não funcionar.');
    sql = {
      async query() { 
        console.warn('⚠️ Tentativa de query sem DATABASE_URL configurada');
        return []; 
      }
    };
  }
} catch (error) {
  console.error('❌ Erro ao conectar ao banco de dados:', error.message);
  console.error('Stack:', error.stack);
  sql = {
    async query() { 
      console.error('❌ Query falhou devido a erro de conexão');
      return []; 
    }
  };
}

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com", 
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrcAttr: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-hashes'"
      ],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ],
      connectSrc: ["'self'", "https:"]
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN || '*' : '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuração de sessão - desabilitada para serverless (não precisa de sessões no portfólio público)
// Se precisar de sessões no futuro, use um store externo como Redis
// Por enquanto, comentamos para evitar warnings e economizar memória
/*
app.use(session({
  secret: process.env.SESSION_SECRET || 'portfolio-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));
*/

// Configurar uploads (usar /tmp no Vercel)
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '../uploads');

// Helper para verificar se diretório existe (fs.promises não tem existsSync)
const fsSync = require('fs');

// Garantir que o diretório existe
if (!process.env.VERCEL) {
  try {
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (error) {
    console.warn('Aviso: Não foi possível criar diretório de uploads:', error.message);
  }
}

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      if (!process.env.VERCEL && !fsSync.existsSync(uploadDir)) {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo não suportado. Use JPG, PNG, WebP ou SVG.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
});

// Helper para verificar se arquivo existe
function fileExists(filePath) {
  try {
    return fsSync.existsSync(filePath);
  } catch {
    return false;
  }
}

// Servir arquivos estáticos
const staticPath = path.join(__dirname, '../frontend/public');
const assetsPath = path.join(__dirname, '../frontend/assets');

// No Vercel, os arquivos estáticos são servidos automaticamente
// Aqui configuramos apenas como fallback
try {
  if (fileExists(staticPath)) {
    app.use(express.static(staticPath, { 
      maxAge: '1d',
      etag: true,
      lastModified: true
    }));
  }
  
  if (fileExists(assetsPath)) {
    app.use('/assets', express.static(assetsPath, {
      maxAge: '7d',
      etag: true,
      lastModified: true
    }));
  }
} catch (error) {
  console.warn('Aviso ao configurar arquivos estáticos:', error.message);
}

// ===== ROTAS PÚBLICAS =====

// Página principal
app.get('/', (req, res) => {
  try {
    const indexPath = path.join(__dirname, '../frontend/public/index.html');
    if (fileExists(indexPath)) {
      res.sendFile(indexPath, {
        maxAge: '1h',
        etag: true,
        lastModified: true
      });
    } else {
      // Fallback: retornar HTML básico se index.html não existir
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Portfólio</title></head>
        <body><h1>Portfólio em manutenção</h1><p>Os arquivos estáticos estão sendo configurados.</p></body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Erro ao servir index.html:', error);
    res.status(500).json({ error: 'Erro ao carregar a página', message: error.message });
  }
});

// API: Listar projetos (público)
app.get('/api/projetos', async (req, res) => {
  try {
    if (!sql || typeof sql.query !== 'function') {
      console.warn('⚠️ SQL não disponível para /api/projetos');
      return res.json([]);
    }
    
    const projetos = await sql`
      SELECT * FROM projetos 
      WHERE ativo = true
      ORDER BY created_at DESC
    `;
    console.log(`✅ Retornados ${projetos?.length || 0} projetos`);
    res.json(projetos || []);
  } catch (error) {
    console.error('❌ Erro ao buscar projetos:', error.message);
    console.error('Stack:', error.stack);
    // Retornar array vazio em caso de erro para não quebrar o site
    res.json([]);
  }
});

// API: Buscar conteúdo dinâmico
app.get('/api/content', async (req, res) => {
  try {
    if (!sql || typeof sql.query !== 'function') {
      console.warn('⚠️ SQL não disponível para /api/content');
      return res.json({});
    }
    
    const content = await sql`
      SELECT section_name, content_key, content_value, content_type 
      FROM site_content 
      ORDER BY section_name, content_key
    `;
    
    const contentObject = {};
    content.forEach(item => {
      if (!contentObject[item.section_name]) {
        contentObject[item.section_name] = {};
      }
      contentObject[item.section_name][item.content_key] = {
        value: item.content_value,
        type: item.content_type
      };
    });
    
    res.json(contentObject);
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    res.json({});
  }
});

// API: Salvar mensagem de contato (pública)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nome, email e mensagem são obrigatórios' });
    }

    if (!sql || !sql.query) {
      // Sem banco, apenas retornar sucesso
      return res.json({ success: true, message: 'Mensagem recebida (banco de dados não configurado)' });
    }
    
    await sql`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (${name}, ${email}, ${subject || ''}, ${message})
    `;
    
    res.json({ success: true, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API: Login (stub - não funcional sem auth.js)
app.post('/api/login', async (req, res) => {
  res.status(404).json({ error: 'Funcionalidade não disponível' });
});

// API: Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.json({ success: true, message: 'Logout realizado com sucesso' });
  });
});

// Middleware para registrar visitas (apenas em rotas públicas)
app.use((req, res, next) => {
  // Registrar visita apenas em rotas públicas e não para assets
  if (!req.path.startsWith('/admin') && !req.path.startsWith('/api') && !req.path.startsWith('/assets') && !req.path.startsWith('/uploads')) {
    // Executar de forma assíncrona sem bloquear a resposta
    setImmediate(async () => {
      try {
        if (sql && sql.query) {
          const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
          const userAgent = req.get('User-Agent') || '';
          const page = req.path;
          const referrer = req.get('Referer') || '';
          
          // Detectar tipo de dispositivo
          let deviceType = 'desktop';
          if (userAgent.includes('Mobile')) deviceType = 'mobile';
          else if (userAgent.includes('Tablet')) deviceType = 'tablet';
          
          // Detectar browser
          let browser = 'unknown';
          if (userAgent.includes('Chrome')) browser = 'Chrome';
          else if (userAgent.includes('Firefox')) browser = 'Firefox';
          else if (userAgent.includes('Safari')) browser = 'Safari';
          else if (userAgent.includes('Edge')) browser = 'Edge';
          
          await sql`
            INSERT INTO analytics_visits (visitor_ip, user_agent, page_visited, referrer, device_type, browser)
            VALUES (${ip}, ${userAgent}, ${page}, ${referrer}, ${deviceType}, ${browser})
          `;
        }
      } catch (error) {
        // Silenciar erros de analytics para não quebrar o site
        console.error('Erro ao registrar visita:', error.message);
      }
    });
  }
  next();
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err.message || err);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Capturar erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

// Rota catch-all - servir index.html para SPA routing
app.use('*', (req, res) => {
  // Se for uma rota de API não encontrada, retornar 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota de API não encontrada' });
  }
  
  // Se for arquivo estático, retornar 404
  if (req.path.startsWith('/assets/') || req.path.startsWith('/uploads/')) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }
  
  // Para outras rotas, tentar servir index.html (SPA routing)
  // Isso permite que o React Router ou qualquer SPA funcione
  try {
    const indexPath = path.join(__dirname, '../frontend/public/index.html');
    if (fileExists(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Página não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao servir index.html (catch-all):', error.message);
    res.status(404).json({ error: 'Página não encontrada' });
  }
});

  // App inicializado com sucesso
  console.log('✅ App inicializado com sucesso');
} catch (initError) {
  console.error('❌ ERRO CRÍTICO na inicialização:', initError.message);
  console.error('Stack:', initError.stack);
  
  // Criar um app mínimo de fallback
  try {
    const expressFallback = require("express");
    app = expressFallback();
    
    app.use((req, res) => {
      console.error('Handler de fallback acionado para:', req.path);
      res.status(500).json({ 
        error: 'Erro na inicialização do servidor',
        message: 'Por favor, verifique os logs do servidor',
        path: req.path
      });
    });
  } catch (fallbackError) {
    console.error('❌ Erro ao criar fallback:', fallbackError);
    // Criar handler mínimo sem Express
    app = (req, res) => {
      res.status(500).json({ error: 'Erro crítico na inicialização' });
    };
  }
}

// Handler wrapper para capturar erros em runtime
const handler = (req, res) => {
  try {
    if (!app) {
      return res.status(500).json({ error: 'Servidor não inicializado' });
    }
    return app(req, res);
  } catch (error) {
    console.error('❌ Erro no handler:', error.message);
    console.error('Stack:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Erro ao processar requisição',
        message: error.message
      });
    }
  }
};

// Exportar como handler do Vercel
// IMPORTANTE: Deve ser uma função que aceita (req, res) diretamente
module.exports = handler;

