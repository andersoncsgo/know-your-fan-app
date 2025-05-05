# Know Your Fan - Desafio Técnico FURIA Tech

Este projeto foi desenvolvido como parte do desafio técnico para a posição de Assistente de Engenharia de Software na FURIA Tech. O objetivo é criar uma solução "Know Your Fan" que permita coletar e centralizar informações sobre fãs de e-sports, especificamente focado no contexto da FURIA.

**Live Demo:**

*   **Frontend (Vercel):** [https://know-your-fan-app.vercel.app/](https://know-your-fan-app.vercel.app/)
*   **Backend (Render):** [https://know-your-fan-app-u87d.onrender.com/](https://know-your-fan-app-u87d.onrender.com/) (API base)

## Funcionalidades Implementadas

*   **Coleta de Dados do Fã:** Formulário para inserir dados básicos (Nome, CPF, Endereço), interesses, atividades, eventos e compras relacionadas ao último ano. O CPF é usado como chave única.
*   **Persistência de Dados:** As informações são salvas em um banco de dados PostgreSQL (em produção no Render) ou SQLite (em desenvolvimento local).
*   **Carregamento de Perfil:** Ao digitar um CPF válido e sair do campo, a aplicação busca e preenche os dados do perfil existente.
*   **Upload de Documento:** Permite o upload de arquivos (PNG, JPG, PDF) associados a um perfil.
    *   _Validação AI:_ Implementada como um **placeholder** no backend que sempre retorna `True`. A integração real com APIs de OCR/verificação de identidade não foi realizada.
*   **Coleta de Links Sociais:** Armazena URLs de perfis em redes sociais (Twitter, Instagram, Twitch).
    *   _Leitura de Dados:_ A funcionalidade de ler interações/seguidores **não foi implementada** devido à complexidade e restrições das APIs oficiais (OAuth, App Review, custos). Apenas os links são salvos.
*   **Coleta e Validação de Links eSports:** Armazena URLs de perfis em sites de e-sports (HLTV, Faceit, etc.).
    *   _Validação de Relevância:_ Implementada uma tentativa de validação no backend:
        1.  Verificação rápida de palavras-chave na URL.
        2.  Se a URL parece relevante, tenta fazer scraping do HTML e analisar o conteúdo das tags `<title>` e `<meta name="description">` por palavras-chave (`furia`, `csgo`, `player`, `team`, etc.).
        3.  **Limitações:** Esta validação **falha frequentemente** devido a:
            *   **Bloqueios Anti-Scraping:** Sites como HLTV retornam erro 403 (Forbidden).
            *   **Conteúdo Dinâmico:** Sites como Furia.gg podem não ter `title`/`meta` preenchidos no HTML inicial ou não conter keywords suficientes nessas tags, resultando em 0 keywords encontradas.
            *   Nesses casos de falha, a validação retorna `False` (indicado como "Falha/Pendente" no frontend).
*   **Tema Light/Dark:** Botão no header para alternar o tema visual da aplicação.
*   **Integração com Chat FURIA:** Se um link de eSports contendo "furia" for salvo com sucesso, o aplicativo [https://chat-fan-28w2.vercel.app/](https://chat-fan-28w2.vercel.app/) é aberto em uma nova aba.

## Tech Stack

*   **Frontend:** React (com Vite), JavaScript, CSS Modules, Axios
*   **Backend:** Python, Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-Cors
*   **Banco de Dados:** PostgreSQL (Produção - Render), SQLite (Desenvolvimento)
*   **Servidor WSGI (Produção):** Gunicorn
*   **Validação de Links:** Requests, BeautifulSoup4
*   **Deployment:**
    *   Frontend: Vercel
    *   Backend & PostgreSQL: Render

## Pré-requisitos (Desenvolvimento Local)

*   Node.js (v18 ou superior recomendado) e npm
*   Python (v3.11 ou a versão especificada em `backend/runtime.txt`) e pip
*   Git
*   (Opcional) DB Browser for SQLite para inspecionar o banco de dados local.

## Configuração e Instalação Local

1.  **Clonar o Repositório:**
    ```bash
    git clone https://github.com/andersoncsgo/know-your-fan-app.git
    cd know-your-fan-app
    ```

2.  **Configurar Backend:**
    *   Navegue até a pasta do backend:
        ```bash
        cd backend
        ```
    *   Crie e ative um ambiente virtual:
        ```bash
        # Windows
        python -m venv venv
        .\venv\Scripts\activate
        # macOS / Linux
        python3 -m venv venv
        source venv/bin/activate
        ```
    *   Instale as dependências:
        ```bash
        pip install -r requirements.txt
        ```
    *   (Opcional) Crie um arquivo `.env` na pasta `backend` para variáveis locais (não necessário se for usar apenas SQLite localmente, mas bom para `SECRET_KEY`):
        ```env
        # backend/.env
        # Não é necessário definir DATABASE_URL para usar o fallback SQLite
        SECRET_KEY='uma_chave_secreta_local_muito_segura_e_diferente_da_producao'
        FRONTEND_URL='http://localhost:5173' # URL do frontend local
        ```
    *   Aplique as migrações do banco de dados (isso criará o `app.db` se não existir):
        ```bash
        # Garanta que FLASK_APP esteja definido (pode ser necessário no seu sistema)
        # Windows PowerShell: $env:FLASK_APP = "run.py"
        # Windows Cmd: set FLASK_APP=run.py
        # Linux/macOS: export FLASK_APP=run.py
        flask db upgrade
        ```

3.  **Configurar Frontend:**
    *   Navegue até a pasta do frontend (a partir da raiz do projeto):
        ```bash
        cd ../frontend-web
        ```
    *   Instale as dependências:
        ```bash
        npm install
        ```
    *   (Opcional) Crie um arquivo `.env.development` na pasta `frontend-web` para definir a URL da API local (se quiser sobrescrever o fallback):
        ```env
        # frontend-web/.env.development
        VITE_API_BASE_URL=http://localhost:5000/api
        ```

## Rodando a Aplicação Localmente

1.  **Iniciar Backend:**
    *   Abra um terminal.
    *   Navegue até a pasta `backend`.
    *   Ative o ambiente virtual (`.\venv\Scripts\activate` ou `source venv/bin/activate`).
    *   Execute o servidor Flask:
        ```bash
        python run.py
        ```
    *   O backend estará rodando em `http://localhost:5000`.

2.  **Iniciar Frontend:**
    *   Abra **outro** terminal.
    *   Navegue até a pasta `frontend-web`.
    *   Execute o servidor de desenvolvimento Vite:
        ```bash
        npm run dev
        ```
    *   Abra seu navegador e acesse o endereço fornecido (geralmente `http://localhost:5173`).

## Estrutura do Projeto
Use code with caution.
Markdown
know-your-fan-app/
├── backend/ # Aplicação Flask (Python)
│ ├── app/ # Módulo principal da aplicação Flask
│ │ ├── init.py # Fábrica da aplicação, configuração CORS, etc.
│ │ ├── models.py # Modelos SQLAlchemy (ex: FanProfile)
│ │ ├── routes.py # Definição das rotas da API (endpoints)
│ │ └── services.py # Lógica de negócio, validações (inclui scraping)
│ ├── migrations/ # Arquivos de migração Flask-Migrate
│ ├── uploads/ # Pasta para uploads locais (NÃO USADA EM PRODUÇÃO RENDER)
│ ├── venv/ # Ambiente virtual Python (local)
│ ├── requirements.txt # Dependências Python
│ ├── config.py # Configurações (lê variáveis de ambiente)
│ └── run.py # Ponto de entrada para Gunicorn / Servidor dev local
│
├── frontend-web/ # Aplicação React (Vite)
│ ├── public/ # Arquivos estáticos públicos
│ ├── src/ # Código fonte do frontend
│ │ ├── assets/ # Imagens, SVGs, etc.
│ │ ├── components/ # Componentes React reutilizáveis (ex: Header)
│ │ ├── services/ # Lógica de chamada da API (api.js com Axios)
│ │ ├── App.css # Estilos globais e do formulário
│ │ ├── App.jsx # Componente principal da aplicação
│ │ ├── index.css # Estilos base (pode estar vazio ou conter resets)
│ │ └── main.jsx # Ponto de entrada da aplicação React
│ ├── .gitignore
│ ├── index.html # HTML principal
│ ├── package.json # Dependências e scripts Node.js
│ └── vite.config.js # Configuração do Vite
│
└── README.md # Este arquivo
## Endpoints da API (Backend)

Todos os endpoints são prefixados com `/api`.

*   `POST /profile`: Cria ou atualiza dados básicos do perfil (pelo CPF).
*   `GET /profile/{cpf}`: Retorna os dados de um perfil específico.
*   `POST /profile/{cpf}/upload_document`: Faz upload de um documento para um perfil.
*   `POST /profile/{cpf}/link_social`: Salva/atualiza links de redes sociais.
*   `POST /profile/{cpf}/link_esports`: Salva/atualiza links de e-sports e tenta validar relevância.

## Limitações Conhecidas e Possíveis Melhorias

*   **Validação AI de Documentos:** Atualmente é um placeholder. Uma implementação real exigiria integração com serviços como Google Vision AI ou AWS Rekognition, incluindo gerenciamento de custos e APIs.
*   **Leitura de Dados de Redes Sociais:** Não implementada devido à alta complexidade das APIs oficiais (OAuth, App Review, Rate Limits, potenciais custos). Apenas os links são armazenados.
*   **Validação de Relevância de Links eSports:** A abordagem atual (scraping + keywords no title/meta) é frágil e frequentemente bloqueada (erro 403) ou ineficaz (0 keywords encontradas) em sites modernos/protegidos. Uma solução robusta exigiria Selenium/Playwright ou APIs/fontes de dados dedicadas.
*   **Armazenamento de Uploads em Produção:** A configuração atual salva uploads localmente. Para produção no Render, é **essencial** implementar armazenamento em um serviço externo (como AWS S3) ou usar um Disco Persistente do Render e configurar o `UPLOAD_FOLDER` corretamente via variáveis de ambiente. **A implementação atual NÃO persistirá uploads no Render.**
*   **Autenticação de Usuário:** Não há sistema de login. Qualquer pessoa pode (teoricamente) ver/editar perfis se souber o CPF e a URL da API. Um sistema de autenticação seria necessário para um app real.
*   **Tratamento de Erros:** Poderia ser mais granular no frontend e backend.