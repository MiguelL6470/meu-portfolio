# Correção Rápida do Erro 500 no Vercel

## Problema Identificado

O erro `500: INTERNAL_SERVER_ERROR` e `FUNCTION_INVOCATION_FAILED` geralmente ocorre por:

1. **Variável `DATABASE_URL` não configurada no Vercel**
2. **Erro na conexão com o banco de dados**
3. **Dependências faltando**

## Solução Rápida

### 1. Verificar Variáveis de Ambiente no Vercel

1. Acesse seu projeto no Vercel
2. Vá em **Settings** > **Environment Variables**
3. Certifique-se de ter configurado:
   ```
   DATABASE_URL=postgresql://usuario:senha@host/database
   SESSION_SECRET=qualquer-string-secreta-aqui
   NODE_ENV=production
   ```

### 2. Verificar Logs do Vercel

1. No painel do Vercel, vá em **Deployments**
2. Clique no deployment com erro
3. Clique em **Functions** > **api/index.js**
4. Clique em **View Logs**
5. Procure por mensagens de erro específicas

### 3. Testar Localmente

Para garantir que funciona localmente:

```bash
# Configure o .env local
echo "DATABASE_URL=sua-url-aqui" > .env
echo "SESSION_SECRET=test-secret" >> .env
echo "NODE_ENV=development" >> .env

# Teste
npm start
```

### 4. Se o Problema Persistir

O handler foi criado para funcionar **mesmo sem banco de dados**, retornando arrays vazios. Se ainda assim der erro:

1. Verifique se todas as dependências estão no `package.json`
2. Verifique os logs do Vercel para ver o erro exato
3. Certifique-se de que o `vercel.json` está correto

## Estrutura Criada

✅ **api/index.js** - Handler do Vercel serverless function
✅ **vercel.json** - Configuração do Vercel
✅ **.vercelignore** - Arquivos ignorados no deploy
✅ **VERCEL_DEPLOY.md** - Instruções completas de deploy

## Próximos Passos

1. Faça commit das mudanças:
   ```bash
   git add api/ vercel.json .vercelignore
   git commit -m "Fix: Configuração para Vercel serverless functions"
   git push
   ```

2. O Vercel fará deploy automático

3. Verifique os logs se ainda houver erro

