# Instruções de Deploy no Vercel

## Pré-requisitos

1. Conta no Vercel (https://vercel.com)
2. Repositório no GitHub
3. Banco de dados Neon configurado
4. Variáveis de ambiente configuradas

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no painel do Vercel:

```
DATABASE_URL=postgresql://usuario:senha@host/database
SESSION_SECRET=seu-secret-super-seguro-aqui
NODE_ENV=production
```

## Passos para Deploy

### 1. Conecte seu repositório ao Vercel

1. Acesse https://vercel.com/dashboard
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub
4. O Vercel detectará automaticamente o projeto Node.js

### 2. Configure as Variáveis de Ambiente

1. No painel do projeto, vá em "Settings" > "Environment Variables"
2. Adicione todas as variáveis necessárias (veja acima)
3. Certifique-se de marcar para todos os ambientes (Production, Preview, Development)

### 3. Configurações de Build

O Vercel usará automaticamente:
- **Build Command**: `npm run vercel-build` (já configurado no package.json)
- **Output Directory**: Configurado automaticamente pelo vercel.json
- **Install Command**: `npm install`

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build e deploy completarem
3. Seu site estará disponível em `https://seu-projeto.vercel.app`

## Estrutura de Arquivos

```
meu-portifolio/
├── api/
│   └── index.js          # Handler do Vercel Serverless Function
├── frontend/
│   ├── public/
│   │   └── index.html    # Página principal
│   └── assets/           # CSS e JS
├── vercel.json           # Configuração do Vercel
├── package.json          # Dependências
└── .env                  # Variáveis locais (não commitado)
```

## Troubleshooting

### Erro 500: FUNCTION_INVOCATION_FAILED

**Possíveis causas:**
1. Variável `DATABASE_URL` não configurada
2. Erro na conexão com o banco de dados
3. Erro no código do handler

**Solução:**
1. Verifique os logs no painel do Vercel: "Deployments" > Seu deploy > "Functions" > "api/index.js" > "View Logs"
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Teste a conexão com o banco de dados localmente primeiro

### Arquivos estáticos não carregam

**Causa:** Configuração incorreta do vercel.json

**Solução:** Verifique se o caminho em `rewrites` está correto para `/assets/:path*`

### Erro de módulo não encontrado

**Causa:** Dependência faltando no package.json

**Solução:** 
1. Execute `npm install` localmente
2. Verifique se todas as dependências estão no `package.json`
3. Faça commit do `package.json` atualizado

## Testes Locais

Para testar localmente como serverless function:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy de teste
vercel

# Deploy para produção
vercel --prod
```

## Suporte

Se continuar com problemas:
1. Verifique os logs do Vercel
2. Teste localmente com `npm start`
3. Verifique se o banco de dados está acessível
4. Verifique se todas as dependências estão instaladas

