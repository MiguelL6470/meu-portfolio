const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

// Sistema de rate limiting para login
const loginAttempts = new Map(); // IP -> { count, lastAttempt, lockedUntil }

// Configurações de rate limiting
const MAX_LOGIN_ATTEMPTS = 4;
const LOCK_DURATION = 12 * 60 * 60 * 1000; // 12 horas em milissegundos
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutos para resetar tentativas

const TOKEN_NAME = 'admin_token';
const getJwtSecret = () => process.env.SESSION_SECRET || 'portfolio-secret-key-change-in-production';

const parseAuthToken = (req) => {
  try {
    const raw = req.headers.cookie;
    if (!raw) return null;
    const parsed = cookie.parse(raw || '');
    return parsed[TOKEN_NAME] || null;
  } catch {
    return null;
  }
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
};

const attachUser = (req, res, next) => {
  const token = parseAuthToken(req);
  if (!token) return next();

  const payload = verifyToken(token);
  if (payload) {
    req.user = { id: payload.id, username: payload.username };
  }
  return next();
};

const generateAuthToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

// Função para verificar se IP está bloqueado
const isIpBlocked = (ip) => {
  const attempts = loginAttempts.get(ip);
  if (!attempts) return false;
  
  const now = Date.now();
  
  // Se o bloqueio expirou, limpar registro
  if (attempts.lockedUntil && now > attempts.lockedUntil) {
    loginAttempts.delete(ip);
    return false;
  }
  
  // Se está dentro da janela de bloqueio
  if (attempts.lockedUntil && now <= attempts.lockedUntil) {
    return {
      blocked: true,
      remainingTime: Math.ceil((attempts.lockedUntil - now) / (60 * 1000)) // minutos restantes
    };
  }
  
  return false;
};

// Middleware para verificar se o usuário está autenticado
const requireAuth = (req, res, next) => {
  if (!req.user) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Acesso não autorizado. Login necessário.' });
    } else {
      return res.redirect('/admin/login');
    }
  }
  next();
};

// Função para registrar tentativa de login
const recordLoginAttempt = (ip, success = false) => {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: now };
  
  if (success) {
    // Login bem-sucedido, limpar tentativas
    loginAttempts.delete(ip);
    return;
  }
  
  // Login falhou, incrementar tentativas
  // Se a última tentativa foi há mais de 15 minutos, resetar contador
  if (now - attempts.lastAttempt > ATTEMPT_WINDOW) {
    attempts.count = 1;
  } else {
    attempts.count++;
  }
  
  attempts.lastAttempt = now;
  
  // Se excedeu o limite, bloquear IP
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockedUntil = now + LOCK_DURATION;
    console.log(`IP ${ip} bloqueado por ${LOCK_DURATION / (60 * 60 * 1000)} horas após ${attempts.count} tentativas`);
  }
  
  loginAttempts.set(ip, attempts);
  return attempts;
};

// Função para obter informações de tentativas restantes
const getRemainingAttempts = (ip) => {
  const attempts = loginAttempts.get(ip);
  if (!attempts) return MAX_LOGIN_ATTEMPTS;
  
  const now = Date.now();
  
  // Se a última tentativa foi há mais de 15 minutos, resetar
  if (now - attempts.lastAttempt > ATTEMPT_WINDOW) {
    return MAX_LOGIN_ATTEMPTS;
  }
  
  return Math.max(0, MAX_LOGIN_ATTEMPTS - attempts.count);
};

// Função para autenticar usuário
const authenticateUser = async (username, password, sql, ip = null) => {
  try {
    const result = await sql`
      SELECT id, username, email, password_hash
      FROM usuarios 
      WHERE username = ${username}
    `;

    if (result.length === 0) {
      return null;
    }

    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return null;
    }

    // Retorna o usuário sem a senha
    return {
      id: user.id,
      username: user.username,
      email: user.email
    };

  } catch (error) {
    console.error('Erro na autenticação:', error);
    return null;
  }
};

// Função para criar hash da senha
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Função para criar novo usuário admin (uso interno)
const createAdminUser = async (username, email, password, sql) => {
  try {
    const hashedPassword = await hashPassword(password);
    
    const result = await sql`
      INSERT INTO usuarios (username, email, password_hash)
      VALUES (${username}, ${email}, ${hashedPassword})
      RETURNING id, username, email
    `;

    return result[0];
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

// Função para alterar senha
const changePassword = async (userId, newPassword, sql) => {
  try {
    const hashedPassword = await hashPassword(newPassword);
    
    const result = await sql`
      UPDATE usuarios 
      SET password_hash = ${hashedPassword}
      WHERE id = ${userId}
      RETURNING id
    `;

    return result.length > 0;
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    throw error;
  }
};

// Função para limpar sessões expiradas (pode ser executada periodicamente)
const cleanExpiredSessions = async (sql) => {
  try {
    await sql`
      DELETE FROM sessoes 
      WHERE expires_at < CURRENT_TIMESTAMP
    `;
    console.log('Sessões expiradas removidas');
  } catch (error) {
    console.error('Erro ao limpar sessões:', error);
  }
};

module.exports = {
  requireAuth,
  authenticateUser,
  hashPassword,
  createAdminUser,
  changePassword,
  cleanExpiredSessions,
  isIpBlocked,
  recordLoginAttempt,
  getRemainingAttempts,
  attachUser,
  generateAuthToken,
  TOKEN_NAME
};
