# backend/app/models.py
from datetime import datetime
from app import db

class FanProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Dados Básicos
    full_name = db.Column(db.String(150), index=True)
    address = db.Column(db.String(300))
    cpf = db.Column(db.String(14), unique=True, index=True) # Formato XXX.XXX.XXX-XX
    # Interesses e Atividades (simplificado como strings, pode ser melhorado com tabelas relacionadas)
    interests = db.Column(db.Text) # Ex: "CS:GO, LoL, Valorant"
    activities_last_year = db.Column(db.Text) # Ex: "Assisti Major X, Fui na BGS"
    events_last_year = db.Column(db.Text) # Ex: "Final CBLOL, IEM Cologne"
    purchases_last_year = db.Column(db.Text) # Ex: "Camisa Furia 2024, Mousepad"
    # Upload de Documentos
    document_path = db.Column(db.String(256)) # Caminho para o arquivo no servidor
    document_validated = db.Column(db.Boolean, default=False)
    # Redes Sociais (simplificado como texto, idealmente seriam IDs/Tokens após OAuth)
    social_media_links = db.Column(db.Text) # Ex: {"twitter": "url", "instagram": "url"} - JSON como string ou usar JSONB se DB suportar
    # Links de Perfis eSports
    esports_profile_links = db.Column(db.Text) # Ex: {"hltv": "url", "faceit": "url"} - JSON como string
    esports_links_validated = db.Column(db.Boolean, default=False)
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<FanProfile {self.full_name} ({self.cpf})>'

    def to_dict(self):
        # Converte o objeto para um dicionário, útil para respostas JSON
        return {
            'id': self.id,
            'full_name': self.full_name,
            'address': self.address,
            'cpf': self.cpf,
            'interests': self.interests,
            'activities_last_year': self.activities_last_year,
            'events_last_year': self.events_last_year,
            'purchases_last_year': self.purchases_last_year,
            'document_path': self.document_path,
            'document_validated': self.document_validated,
            'social_media_links': self.social_media_links,
            'esports_profile_links': self.esports_profile_links,
            'esports_links_validated': self.esports_links_validated,
            'created_at': self.created_at.isoformat() + 'Z',
            'updated_at': self.updated_at.isoformat() + 'Z',
        }