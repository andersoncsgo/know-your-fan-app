# backend/app/__init__.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Garante que a pasta de uploads existe
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    # Inicializa extensões
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app) # Permite requisições de qualquer origem (ajuste em produção!)

    # Registra blueprints (onde as rotas estão definidas)
    from app.routes import bp as main_bp
    app.register_blueprint(main_bp, url_prefix='/api') # Prefixo /api para todas as rotas

    return app

# Importa modelos para que o Flask-Migrate possa encontrá-los
from app import models