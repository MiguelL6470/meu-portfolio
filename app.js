require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const multer = require("multer");
const { neon } = require("@neondatabase/serverless");
const { put } = require("@vercel/blob");
const auth = require("./auth");

const app = express();

const createStubSql = (reason) => {
  const stub = async () => {
    console.warn(reason);
    return [];
  };
  stub.isStub = true;
  stub.query = stub;
  return stub;
};

let sql;
try {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL não configurada.");
    sql = createStubSql("⚠️ Sem DATABASE_URL configurada");
  } else {
    sql = neon(process.env.DATABASE_URL);
    console.log("✅ Cliente do banco configurado");
  }
} catch (err) {
  console.error("❌ Erro ao criar cliente do banco:", err.message);
  sql = createStubSql("❌ Falha ao criar cliente do banco");
}
// Storage: Vercel Blob (BLOB_READ_WRITE_TOKEN é lido automaticamente do ambiente)
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

const storagePathFor = (file) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(file.originalname);
  return `uploads/${timestamp}-${randomString}${extension}`;
};

const publicUrlFor = (filePath) => {
  if (!filePath) return "";
  // Uploads via Vercel Blob já armazenam a URL pública completa.
  if (filePath.startsWith("http")) return filePath;
  return filePath.startsWith("/") ? filePath.slice(1) : filePath;
};

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameSrc: ["'self'", "https://vercel.live"],
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
  origin: process.env.NODE_ENV === 'production' ? 'your-domain.com' : 'http://localhost:3010',
  credentials: true
}));

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para anexar usuário autenticado via JWT em cookie
app.use(auth.attachUser);

// Configuração do multer para upload de imagens (usa memória para enviar ao Supabase)
const storage = multer.memoryStorage();

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

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'frontend/public')));
app.use('/assets', express.static(path.join(__dirname, 'frontend/assets')));
// Uploads agora são servidos via URLs públicas do Supabase

// ===== ROTAS PÚBLICAS =====

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public/index.html'));
});

// API: Listar projetos ativos
app.get('/api/projetos', async (req, res) => {
  try {
    const projetos = await sql`
      SELECT id, titulo, descricao, tecnologias, github_url, demo_url, imagem_url, destaque
      FROM projetos 
      WHERE ativo = true 
      ORDER BY destaque DESC, created_at DESC
    `;
    const projetosComImagem = projetos.map((projeto) => ({
      ...projeto,
      imagem_url: publicUrlFor(projeto.imagem_url)
    }));
    res.json(projetosComImagem);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API: Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    // Verificar se IP está bloqueado
    const blockStatus = auth.isIpBlocked(clientIp);
    if (blockStatus && blockStatus.blocked) {
      return res.status(429).json({ 
        error: `Muitas tentativas de login. Tente novamente em ${blockStatus.remainingTime} minutos.`,
        blocked: true,
        remainingTime: blockStatus.remainingTime
      });
    }

    const user = await auth.authenticateUser(username, password, sql, clientIp);
    
    if (user) {
      // Login bem-sucedido
      auth.recordLoginAttempt(clientIp, true);
      const token = auth.generateAuthToken(user);
      res.cookie(auth.TOKEN_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      res.json({ success: true, message: 'Login realizado com sucesso' });
    } else {
      // Login falhou
      auth.recordLoginAttempt(clientIp, false);
      const remainingAttempts = auth.getRemainingAttempts(clientIp);
      
      res.status(401).json({ 
        error: '',
        remainingAttempts: remainingAttempts,
        warning: remainingAttempts <= 1 ? 'Atenção: você será bloqueado após mais uma tentativa incorreta.' : null
      });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API: Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie(auth.TOKEN_NAME, {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  });
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

// API: Reset de configurações para valores padrão
app.post('/api/admin/settings/reset', auth.requireAuth, async (req, res) => {
  try {
    // Configurações padrão (cores reais da index.html)
    const defaultSettings = {
      'site_title': 'Meu Portfólio',
      'main_email': 'admin@exemplo.com', 
      'site_description': 'Descrição do site',
      'maintenance_mode': 'false',
      'analytics_enabled': 'true',
      'primary_color': '#667eea',
      'secondary_color': '#764ba2',
      'meta_description': 'Meta descrição padrão',
      'github_url': '',
      'linkedin_url': ''
    };

    // Limpar configurações existentes
    await sql`DELETE FROM site_settings`;

    // Inserir configurações padrão
    for (const [key, value] of Object.entries(defaultSettings)) {
      const type = typeof value === 'boolean' ? 'boolean' : 'string';
      await sql`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at)
        VALUES (${key}, ${String(value)}, ${type}, CURRENT_TIMESTAMP)
      `;
    }

    res.json({ success: true, message: 'Configurações restauradas aos valores padrão' });
  } catch (error) {
    console.error('Erro ao resetar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== ROTAS ADMINISTRATIVAS =====

// Página de login admin (sem autenticação)
app.get('/admin/login', (req, res) => {
  if (req.user) {
    return res.redirect('/admin');
  }
  res.sendFile(path.join(__dirname, 'frontend/public/login.html'));
});

// Middleware de autenticação para rotas admin (exceto login)
app.use('/admin', (req, res, next) => {
  if (req.path === '/login') return next();
  return auth.requireAuth(req, res, next);
});
app.use('/api/admin', auth.requireAuth);

// Painel administrativo (requer autenticação)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public/admin-new.html'));
});

// API: Criar projeto
app.post('/api/admin/projetos', async (req, res) => {
  try {
    const { titulo, descricao, tecnologias, github_url, demo_url, imagem_url, destaque } = req.body;
    
    if (!titulo || !descricao) {
      return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
    }

    const imagemUrlNormalizada = publicUrlFor(imagem_url);

    const result = await sql`
      INSERT INTO projetos (titulo, descricao, tecnologias, github_url, demo_url, imagem_url, destaque)
      VALUES (${titulo}, ${descricao}, ${tecnologias || ''}, ${github_url || ''}, ${demo_url || ''}, ${imagemUrlNormalizada || ''}, ${destaque || false})
      RETURNING *
    `;
    
    const projeto = result[0];
    res.json({
      ...projeto,
      imagem_url: publicUrlFor(projeto.imagem_url)
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API: Atualizar projeto
app.put('/api/admin/projetos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, tecnologias, github_url, demo_url, imagem_url, destaque, ativo } = req.body;

    const imagemUrlNormalizada = publicUrlFor(imagem_url);
    
    const result = await sql`
      UPDATE projetos 
      SET titulo = ${titulo}, descricao = ${descricao}, tecnologias = ${tecnologias || ''}, 
          github_url = ${github_url || ''}, demo_url = ${demo_url || ''}, imagem_url = ${imagemUrlNormalizada || ''}, 
          destaque = ${destaque || false}, ativo = ${ativo !== undefined ? ativo : true},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    const projeto = result[0];
    res.json({
      ...projeto,
      imagem_url: publicUrlFor(projeto.imagem_url)
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API: Deletar projeto
app.delete('/api/admin/projetos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await sql`
      DELETE FROM projetos WHERE id = ${id}
      RETURNING id
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    res.json({ success: true, message: 'Projeto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API: Listar todos os projetos (incluindo inativos)
app.get('/api/admin/projetos', async (req, res) => {
  try {
    const projetos = await sql`
      SELECT * FROM projetos 
      ORDER BY created_at DESC
    `;
    const projetosComImagem = projetos.map((projeto) => ({
      ...projeto,
      imagem_url: publicUrlFor(projeto.imagem_url)
    }));
    res.json(projetosComImagem);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== UPLOAD DE IMAGENS =====

// API: Upload de imagem
app.post('/api/admin/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    if (!blobToken) {
      throw new Error("Storage não configurado: defina BLOB_READ_WRITE_TOKEN (Vercel Blob)");
    }

    const storagePath = storagePathFor(req.file);
    const storedFileName = path.basename(storagePath);
    const blob = await put(storagePath, req.file.buffer, {
      access: "public",
      contentType: req.file.mimetype,
      token: blobToken,
    });

    const fileUrl = blob.url; // URL pública completa do Vercel Blob

    // Salvar informações do arquivo no banco (file_path = URL pública completa)
    const uploadRecord = await sql`
      INSERT INTO uploads (filename, original_name, file_path, file_size, mime_type, alt_text, uploaded_by)
      VALUES (${storedFileName}, ${req.file.originalname}, ${fileUrl}, ${req.file.size}, ${req.file.mimetype}, ${req.body.alt_text || ''}, ${req.user?.id || null})
      RETURNING *
    `;

    res.json({
      success: true,
      file: {
        id: uploadRecord[0].id,
        filename: storedFileName,
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimeType: req.file.mimetype,
        altText: req.body.alt_text || ''
      }
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: error?.message || 'Erro interno do servidor' });
  }
});

// API: Listar uploads
app.get('/api/admin/uploads', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const uploads = await sql`
      SELECT u.*, usr.username as uploaded_by_name
      FROM uploads u
      LEFT JOIN usuarios usr ON u.uploaded_by = usr.id
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const uploadsWithUrl = uploads.map(item => ({
      ...item,
      url: publicUrlFor(item.file_path || item.filename)
    }));
    
    const total = await sql`SELECT COUNT(*) as count FROM uploads`;
    
    res.json({
      uploads: uploadsWithUrl,
      pagination: {
        page,
        limit,
        total: total[0].count,
        pages: Math.ceil(total[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar uploads:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API: Deletar upload
app.delete('/api/admin/uploads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar informações do arquivo
    const upload = await sql`
      SELECT * FROM uploads WHERE id = ${id}
    `;
    
    if (upload.length === 0) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Deletar arquivo no storage (Vercel Blob)
    const storedUrl = upload[0].file_path || upload[0].filename;
    try {
      if (storedUrl && storedUrl.startsWith('http') && blobToken) {
        const { del } = require("@vercel/blob");
        await del(storedUrl, { token: blobToken });
      }
    } catch (err) {
      console.warn('Erro ao remover arquivo do Blob:', err.message);
    }
    
    // Deletar registro do banco
    await sql`DELETE FROM uploads WHERE id = ${id}`;
    
    res.json({ success: true, message: 'Arquivo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== CONFIGURAÇÕES DO SITE =====

// API: Buscar configurações do site
app.get('/api/admin/settings', async (req, res) => {
  try {
    const settings = await sql`
      SELECT setting_key, setting_value, setting_type 
      FROM site_settings 
      ORDER BY setting_key
    `;
    
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.setting_key] = {
        value: setting.setting_value,
        type: setting.setting_type
      };
    });
    
    res.json(settingsObject);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API: Atualizar configurações do site
app.put('/api/admin/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    for (const [key, value] of Object.entries(settings)) {
      // Determinar o tipo
      const type = typeof value === 'boolean' ? 'boolean' : 'string';
      const settingValue = String(value);
      
      // UPSERT (INSERT ou UPDATE)
      await sql`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at, updated_by)
        VALUES (${key}, ${settingValue}, ${type}, CURRENT_TIMESTAMP, ${req.user?.id || null})
        ON CONFLICT (setting_key) 
        DO UPDATE SET 
          setting_value = EXCLUDED.setting_value,
          setting_type = EXCLUDED.setting_type,
          updated_at = CURRENT_TIMESTAMP,
          updated_by = EXCLUDED.updated_by
      `;
    }
    
    res.json({ success: true, message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== CONTEÚDO DO SITE =====

// API: Buscar conteúdo do site
app.get('/api/content', async (req, res) => {
  try {
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
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API: Atualizar conteúdo do site
app.put('/api/admin/content', async (req, res) => {
  try {
    const { section, content } = req.body;
    
    for (const [key, data] of Object.entries(content)) {
      await sql`
        INSERT INTO site_content (section_name, content_key, content_value, content_type)
        VALUES (${section}, ${key}, ${data.value}, ${data.type || 'text'})
        ON CONFLICT (section_name, content_key) 
        DO UPDATE SET 
          content_value = ${data.value}, 
          updated_at = CURRENT_TIMESTAMP
      `;
    }
    
    res.json({ success: true, message: 'Conteúdo atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== MENSAGENS DE CONTATO =====

// API: Salvar mensagem de contato (pública)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nome, email e mensagem são obrigatórios' });
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

// API: Listar mensagens de contato (admin)
app.get('/api/admin/messages', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const messages = await sql`
      SELECT * FROM contact_messages 
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const total = await sql`SELECT COUNT(*) as count FROM contact_messages`;
    const unread = await sql`SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'`;
    
    res.json({
      messages,
      pagination: {
        page,
        limit,
        total: total[0].count,
        pages: Math.ceil(total[0].count / limit)
      },
      unreadCount: unread[0].count
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API: Marcar mensagem como lida
app.put('/api/admin/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    await sql`
      UPDATE contact_messages 
      SET status = 'read', read_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    
    res.json({ success: true, message: 'Mensagem marcada como lida' });
  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== ANALYTICS =====

// Middleware para registrar visitas (apenas em rotas públicas)
app.use((req, res, next) => {
  // Registrar visita apenas em rotas públicas e não para assets
  if (!req.path.startsWith('/admin') && !req.path.startsWith('/api') && !req.path.startsWith('/assets') && !req.path.startsWith('/uploads')) {
    // Executar de forma assíncrona sem bloquear a resposta
    setImmediate(async () => {
      try {
        const ip = req.ip || req.connection.remoteAddress;
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
      } catch (error) {
        console.error('Erro ao registrar visita:', error);
      }
    });
  }
  next();
});

// API: Analytics dashboard (admin)
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Visitas hoje
    const todayVisits = await sql`
      SELECT COUNT(*) as count FROM analytics_visits 
      WHERE DATE(created_at) = ${today}
    `;
    
    // Visitas última semana
    const weekVisits = await sql`
      SELECT COUNT(*) as count FROM analytics_visits 
      WHERE created_at >= ${lastWeek}
    `;
    
    // Visitas último mês
    const monthVisits = await sql`
      SELECT COUNT(*) as count FROM analytics_visits 
      WHERE created_at >= ${lastMonth}
    `;
    
    // Páginas mais visitadas
    const popularPages = await sql`
      SELECT page_visited, COUNT(*) as visits 
      FROM analytics_visits 
      WHERE created_at >= ${lastMonth}
      GROUP BY page_visited 
      ORDER BY visits DESC 
      LIMIT 10
    `;
    
    // Dispositivos
    const deviceStats = await sql`
      SELECT device_type, COUNT(*) as count 
      FROM analytics_visits 
      WHERE created_at >= ${lastMonth}
      GROUP BY device_type 
      ORDER BY count DESC
    `;
    
    // Browsers
    const browserStats = await sql`
      SELECT browser, COUNT(*) as count 
      FROM analytics_visits 
      WHERE created_at >= ${lastMonth}
      GROUP BY browser 
      ORDER BY count DESC 
      LIMIT 5
    `;
    
    // Visitas por dia (últimos 7 dias)
    const dailyVisits = await sql`
      SELECT DATE(created_at) as date, COUNT(*) as visits 
      FROM analytics_visits 
      WHERE created_at >= ${lastWeek}
      GROUP BY DATE(created_at) 
      ORDER BY date ASC
    `;
    
    res.json({
      summary: {
        today: todayVisits[0].count,
        week: weekVisits[0].count,
        month: monthVisits[0].count
      },
      popularPages,
      deviceStats,
      browserStats,
      dailyVisits
    });
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3010;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📱 Painel admin em http://localhost:${PORT}/admin`);
  });
};

module.exports = { app, startServer, sql };
