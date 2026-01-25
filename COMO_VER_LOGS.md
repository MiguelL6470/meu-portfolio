# 🔍 Como Ver os Logs do Vercel para Diagnosticar o Erro 500

## Passo a Passo para Ver os Logs

### 1. Acesse o Painel do Vercel
- Vá em https://vercel.com/dashboard
- Faça login na sua conta

### 2. Abra seu Projeto
- Clique no projeto que está com erro

### 3. Vá em Deployments
- No menu lateral, clique em **"Deployments"**
- Você verá uma lista de todos os deploys

### 4. Encontre o Deployment com Erro
- Procure o deployment mais recente (geralmente o primeiro da lista)
- Ele pode estar marcado com status **"Error"** ou **"Ready"** (mesmo com erro 500)

### 5. Acesse os Logs da Function
- Clique no deployment
- Na página do deployment, procure por **"Functions"** ou **"Serverless Functions"**
- Clique em **"api/index.js"** ou no nome da sua function
- Clique em **"View Logs"** ou **"View Function Logs"**

### 6. Analise os Logs

Procure por:

#### ✅ Logs de Sucesso (verde):
- `🚀 Inicializando handler do Vercel...`
- `✅ Conectando ao banco de dados...`
- `✅ Banco de dados configurado`
- `✅ App inicializado com sucesso`

#### ❌ Logs de Erro (vermelho):
- `❌ ERRO CRÍTICO na inicialização:`
- `❌ Erro ao conectar ao banco de dados:`
- `SyntaxError`
- `Module not found`
- Qualquer mensagem de erro em vermelho

### 7. Copie os Logs

Copie as últimas linhas dos logs e me envie para que eu possa ajudar a diagnosticar o problema específico.

## O Que Procurar nos Logs

### Se aparecer:
```
❌ DATABASE_URL não configurada
```
→ **Solução:** Adicione `DATABASE_URL` nas variáveis de ambiente

### Se aparecer:
```
❌ ERRO CRÍTICO na inicialização: Cannot find module 'xyz'
```
→ **Solução:** Falta uma dependência. Execute `npm install` localmente e faça commit do `package.json`

### Se aparecer:
```
❌ Erro ao conectar ao banco de dados: connection timeout
```
→ **Solução:** Verifique se a `DATABASE_URL` está correta e se o banco permite conexões externas

### Se aparecer:
```
SyntaxError: Unexpected token
```
→ **Solução:** Erro de sintaxe no código (mas isso já foi verificado no build)

## Como Fazer Redeploy Depois de Corrigir

1. Depois de corrigir o problema:
   - Faça commit das mudanças: `git commit -m "Fix: ..."`
   - Faça push: `git push origin main`
   - O Vercel fará deploy automático

2. OU faça redeploy manual:
   - Vá em Deployments
   - Clique nos três pontos do deployment
   - Clique em **"Redeploy"**

## Enviando os Logs para Análise

Quando copiar os logs, procure por:
1. A primeira mensagem de erro (geralmente no topo)
2. A stack trace completa (as linhas com `at ...`)
3. Qualquer mensagem que comece com `❌` ou `Error:`

## Exemplo de Como os Logs Devem Aparecer

```
🚀 Inicializando handler do Vercel...
NODE_ENV: production
DATABASE_URL: ✅ Configurada
SESSION_SECRET: ✅ Configurada
✅ Conectando ao banco de dados...
✅ Banco de dados configurado
✅ App inicializado com sucesso
```

Se você ver algo diferente disso, especialmente mensagens de erro, copie e me envie!

