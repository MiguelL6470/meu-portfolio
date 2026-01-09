# 🔐 Variáveis de Ambiente Necessárias no Vercel

## ⚠️ IMPORTANTE: No Vercel, NÃO se usa arquivo `.env`!

No Vercel, você configura as variáveis de ambiente diretamente no **painel web**, não através de arquivo `.env`.

## 📋 Variáveis Obrigatórias

### 1. **DATABASE_URL** ✅ (Você já configurou)
```
DATABASE_URL=postgresql://usuario:senha@host/database
```
- **Onde pegar:** No painel do Neon Database
- **Formato:** `postgresql://user:password@host.neon.tech/database?sslmode=require`

### 2. **SESSION_SECRET** ❌ (FALTANDO - Isso pode estar causando o erro!)
```
SESSION_SECRET=uma-string-super-secreta-aleatoria-aqui
```
- **Como gerar:** Qualquer string aleatória longa (recomendado: 32+ caracteres)
- **Exemplo:** `meu-portfolio-secret-key-2024-super-seguro-abc123xyz`
- **Importância:** Usado para criptografar sessões. Sem isso, pode causar crashes!

### 3. **NODE_ENV** ⚠️ (Recomendado)
```
NODE_ENV=production
```
- Define o ambiente como produção
- Ativa otimizações e configurações de segurança

## 📋 Variáveis Opcionais

### 4. **ALLOWED_ORIGIN** (Opcional)
```
ALLOWED_ORIGIN=https://seu-dominio.vercel.app
```
- Restringe requisições CORS para um domínio específico
- Se não configurado, aceita qualquer origem (padrão: `*`)

## 🚀 Como Configurar no Vercel

### Passo a Passo:

1. **Acesse o painel do Vercel:**
   - Vá em https://vercel.com/dashboard
   - Clique no seu projeto

2. **Vá em Settings:**
   - No menu lateral, clique em **Settings**

3. **Clique em Environment Variables:**
   - No menu lateral, clique em **Environment Variables**

4. **Adicione cada variável:**
   - Clique em **Add New**
   - **Key:** `DATABASE_URL`
   - **Value:** Cole sua URL do banco de dados
   - **Environment:** Selecione todas (Production, Preview, Development)
   - Clique em **Save**
   
   - Repita para:
     - **SESSION_SECRET** (obrigatória!)
     - **NODE_ENV** = `production`
     - **ALLOWED_ORIGIN** (opcional)

5. **Faça um novo deploy:**
   - Após adicionar as variáveis, você precisa fazer um novo deploy
   - Vá em **Deployments**
   - Clique nos três pontos do último deployment
   - Clique em **Redeploy**
   - OU faça um novo commit/push para trigger automático

## 🔍 Como Verificar se Está Funcionando

1. **Verifique os Logs:**
   - Vá em **Deployments** > Clique no deployment mais recente
   - Clique em **Functions** > **api/index.js**
   - Clique em **View Logs**
   - Procure por mensagens como:
     - ✅ `Conectando ao banco de dados...`
     - ✅ `Banco de dados configurado`
     - ❌ `DATABASE_URL não configurada`
     - ❌ `Erro ao conectar ao banco de dados`

2. **Teste a API:**
   - Acesse: `https://seu-projeto.vercel.app/api/projetos`
   - Deve retornar JSON (mesmo que vazio `[]`)

## ⚠️ Problemas Comuns

### Erro 500 ainda persiste?

1. **Verifique os logs** (mais importante!)
   - Os logs mostram exatamente qual erro está acontecendo

2. **Certifique-se que fez redeploy:**
   - Variáveis de ambiente só são aplicadas em novos deploys

3. **Verifique o formato da DATABASE_URL:**
   - Deve começar com `postgresql://`
   - Não pode ter espaços
   - Deve ter `?sslmode=require` no final (para Neon)

4. **SESSION_SECRET deve ser uma string:**
   - Não pode estar vazia
   - Recomendado: 32+ caracteres aleatórios

## 📝 Exemplo Completo de Variáveis

```
DATABASE_URL=postgresql://user:pass@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=meu-portfolio-2024-super-secret-key-abc123xyz789
NODE_ENV=production
ALLOWED_ORIGIN=https://meu-portifolio.vercel.app
```

## 💡 Sobre o arquivo `.env` local

O arquivo `.env` é usado **APENAS para desenvolvimento local** (no seu computador). 

- **Localmente:** Crie um arquivo `.env` na raiz do projeto
- **No Vercel:** Configure no painel web (Settings > Environment Variables)
- **Nunca faça commit** do arquivo `.env` no Git (já está no .gitignore)

## 🔗 Links Úteis

- [Documentação do Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon Database - Connection String](https://neon.tech/docs/connect/connect-from-any-app)

