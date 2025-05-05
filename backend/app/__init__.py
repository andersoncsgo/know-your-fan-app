# backend/app/__init__.py (ATUALIZADO para CORS de Produção)
import os
import logging # Importa logging para melhor controle
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config # Importa sua classe de configuração

# Configuração básica de logging (opcional, mas útil)
logging.basicConfig(level=logging.INFO) # Define o nível mínimo para INFO

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    """Fábrica de aplicação Flask."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Garante que a pasta de uploads exista (CUIDADO: Não funcionará bem no Render sem disco persistente/S3)
    # É melhor confiar que o disco persistente ou o bucket S3 já existem.
    # Mas deixaremos aqui por enquanto, pode ser útil localmente.
    try:
        # Verifica se UPLOAD_FOLDER está definido antes de usar
        upload_folder = app.config.get('UPLOAD_FOLDER')
        if upload_folder and not os.path.exists(upload_folder):
             app.logger.info(f"Upload folder '{upload_folder}' not found, attempting to create.")
             os.makedirs(upload_folder)
    except OSError as e:
         app.logger.error(f"Could not create upload folder '{upload_folder}': {e}")
         # Considerar se deve parar a aplicação aqui ou continuar sem uploads funcionais

    # Inicializa extensões do Flask
    db.init_app(app)
    migrate.init_app(app, db)

    # --- Configuração CORS (Específica para Produção/Desenvolvimento) ---
    # Lê a URL do frontend da variável de ambiente 'FRONTEND_URL'
    frontend_url = os.environ.get('FRONTEND_URL')

    if frontend_url:
        # Se a variável FRONTEND_URL estiver definida (esperado em produção no Render)
        app.logger.info(f"Configuring CORS for specific origin: {frontend_url}")
        # Permite requisições APENAS da URL especificada
        CORS(app, origins=[frontend_url], supports_credentials=True)
    else:
        # Se FRONTEND_URL não estiver definida (ambiente local de desenvolvimento)
        # Use a porta que o seu frontend Vite roda localmente (geralmente 5173)
        dev_frontend_url = 'http://localhost:5173'
        app.logger.warning(f"FRONTEND_URL environment variable not set. Defaulting CORS to allow {dev_frontend_url} for local development.")
        # Permite requisições do localhost para desenvolvimento
        CORS(app, origins=[dev_frontend_url], supports_credentials=True)
        # ATENÇÃO: Se precisar permitir qualquer origem localmente (menos seguro):
        # CORS(app)
    # --- Fim Configuração CORS ---

    # Registra blueprints (onde as rotas da API estão definidas)
    try:
        from app.routes import bp as main_bp
        app.register_blueprint(main_bp, url_prefix='/api') # Define o prefixo /api
        app.logger.info("Main blueprint registered under /api prefix.")
    except ImportError:
        app.logger.error("Could not import or register main blueprint from app.routes.")
        # Considerar levantar um erro aqui se o blueprint for essencial

    # Mensagem indicando que a app foi criada
    app.logger.info("Flask app created successfully.")

    return app

# Importa modelos DEPOIS da inicialização do db, para que eles possam usar 'db'
# Isso também ajuda o Flask-Migrate a encontrar os modelos.
from app import models