# Meu Portfólio

Portfólio profissional desenvolvido para showcase de projetos e serviços de desenvolvimento web.

## 🚀 Tecnologias

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Banco de Dados**: PostgreSQL (Neon)
- **Segurança**: Helmet, CORS, Express Session

## 📋 Funcionalidades

- Exibição de projetos em grid responsivo
- Busca e filtros de projetos por tecnologia
- Seção de contato com links sociais
- Design responsivo e moderno
- Suporte a modo claro/escuro
- Animações suaves e interativas

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/meu-portifolio.git
cd meu-portifolio
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicialize o banco de dados:
```bash
npm run init-db
```

5. Inicie o servidor:
```bash
npm start
```

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
DATABASE_URL=sua_url_do_banco
SESSION_SECRET=seu_secret_key_seguro
NODE_ENV=production
PORT=3010
```

## 🎨 Estrutura do Projeto

```
meu-portifolio/
├── frontend/          # Arquivos frontend
│   ├── assets/       # CSS e JavaScript
│   └── public/       # Arquivos HTML
├── backend/          # Configurações do backend
├── scripts/          # Scripts utilitários
├── app.js            # Aplicação principal
├── auth.js           # Autenticação
└── run.js            # Ponto de entrada
```

## 📄 Licença

MIT License

## 👤 Autor

Miguel Luiz Lisboa

## 🔗 Links

- [GitHub](https://github.com/MiguelL6470/)
- [LinkedIn](https://www.linkedin.com/in/miguel-luiz-lisboa-03297834b/)
