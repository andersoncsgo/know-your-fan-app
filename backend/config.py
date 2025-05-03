# backend/config.py
import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env')) # Carrega variáveis do .env se existir

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'uma-chave-secreta-muito-forte'
    # Usaremos SQLite para simplicidade inicial. Fácil de trocar depois.
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads') # Pasta para guardar uploads
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # Limite de 16MB para uploads
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'} # Extensões permitidas para documentos

    # Configurações para APIs de AI (adicione quando necessário)
    # GOOGLE_APPLICATION_CREDENTIALS = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    # AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    # AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    # OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')