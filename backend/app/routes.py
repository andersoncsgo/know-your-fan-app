# backend/app/routes.py
import os
import json
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app import db
from app.models import FanProfile
from app.services import validate_document_with_ai, validate_esports_link_relevance, allowed_file

bp = Blueprint('main', __name__)

@bp.route('/profile', methods=['POST'])
def create_or_update_profile():
    """ Cria ou atualiza o perfil básico do fã """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Requisição inválida, sem dados JSON."}), 400

    cpf = data.get('cpf')
    if not cpf:
         return jsonify({"error": "CPF é obrigatório."}), 400

    # Tenta encontrar um perfil existente pelo CPF
    profile = FanProfile.query.filter_by(cpf=cpf).first()

    if profile:
        # Atualiza perfil existente
        profile.full_name = data.get('full_name', profile.full_name)
        profile.address = data.get('address', profile.address)
        profile.interests = data.get('interests', profile.interests)
        profile.activities_last_year = data.get('activities_last_year', profile.activities_last_year)
        profile.events_last_year = data.get('events_last_year', profile.events_last_year)
        profile.purchases_last_year = data.get('purchases_last_year', profile.purchases_last_year)
        # Links são atualizados em rotas separadas
        message = "Perfil atualizado com sucesso."
    else:
        # Cria novo perfil
        profile = FanProfile(
            cpf=cpf,
            full_name=data.get('full_name'),
            address=data.get('address'),
            interests=data.get('interests'),
            activities_last_year=data.get('activities_last_year'),
            events_last_year=data.get('events_last_year'),
            purchases_last_year=data.get('purchases_last_year'),
            # Inicializa outros campos se necessário
        )
        db.session.add(profile)
        message = "Perfil criado com sucesso."

    try:
        db.session.commit()
        return jsonify({"message": message, "profile": profile.to_dict()}), 201 if not profile else 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erro ao salvar perfil: {e}")
        return jsonify({"error": "Erro interno ao salvar perfil."}), 500

@bp.route('/profile/<cpf>/upload_document', methods=['POST'])
def upload_document(cpf):
    """ Faz upload do documento para um perfil específico e tenta validar com AI """
    profile = FanProfile.query.filter_by(cpf=cpf).first()
    if not profile:
        return jsonify({"error": "Perfil não encontrado."}), 404

    if 'document' not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado."}), 400

    file = request.files['document']
    if file.filename == '':
        return jsonify({"error": "Nome de arquivo vazio."}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(f"{profile.cpf}_{file.filename}") # Nome seguro e único
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        try:
            file.save(file_path)
            profile.document_path = file_path # Salva o caminho no DB

            # --- Chamada ao Placeholder de Validação AI ---
            is_valid = validate_document_with_ai(file_path)
            profile.document_validated = is_valid
            # -------------------------------------------

            db.session.commit()
            status = "Documento enviado e validado (placeholder)." if is_valid else "Documento enviado, falha na validação (placeholder)."
            return jsonify({"message": status, "file_path": file_path, "validated": is_valid}), 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Erro ao salvar ou validar documento: {e}")
            # Tenta remover o arquivo se a transação falhar
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({"error": "Erro interno ao processar o arquivo."}), 500
    else:
        return jsonify({"error": "Tipo de arquivo não permitido."}), 400

@bp.route('/profile/<cpf>/link_social', methods=['POST'])
def link_social_media(cpf):
    """ Adiciona/Atualiza links de redes sociais """
    profile = FanProfile.query.filter_by(cpf=cpf).first()
    if not profile:
        return jsonify({"error": "Perfil não encontrado."}), 404

    data = request.get_json()
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Dados inválidos. Envie um JSON com os links."}), 400

    # Assume que 'data' é um dicionário {"twitter": "url", "instagram": "url", ...}
    # Converte para string JSON para armazenar no campo Text (simplificado)
    profile.social_media_links = json.dumps(data)

    # Aqui seria o local para iniciar fluxos OAuth ou scraping (complexo e não recomendado sem cuidado)
    current_app.logger.info(f"PLACEHOLDER: Links sociais {data} recebidos para {cpf}. Nenhuma validação externa feita.")

    try:
        db.session.commit()
        return jsonify({"message": "Links de redes sociais atualizados.", "profile": profile.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erro ao salvar links sociais: {e}")
        return jsonify({"error": "Erro interno ao salvar links sociais."}), 500

@bp.route('/profile/<cpf>/link_esports', methods=['POST'])
def link_esports_profiles(cpf):
    """ Adiciona/Atualiza links de perfis eSports e tenta validar relevância com AI """
    profile = FanProfile.query.filter_by(cpf=cpf).first()
    if not profile:
        return jsonify({"error": "Perfil não encontrado."}), 404

    data = request.get_json()
    if not data or not isinstance(data, dict):
         return jsonify({"error": "Dados inválidos. Envie um JSON com os links."}), 400

    profile.esports_profile_links = json.dumps(data) # Salva links como JSON string

    # --- Chamada ao Placeholder de Validação AI para cada link ---
    all_links_valid = True
    validation_results = {}
    for platform, url in data.items():
        is_relevant = validate_esports_link_relevance(url)
        validation_results[platform] = is_relevant
        if not is_relevant:
            all_links_valid = False
    profile.esports_links_validated = all_links_valid
    # ----------------------------------------------------------

    try:
        db.session.commit()
        status = "Links eSports atualizados e validados (placeholder)." if all_links_valid else "Links eSports atualizados, alguns não validados (placeholder)."
        return jsonify({
            "message": status,
            "validation_results": validation_results,
            "profile": profile.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erro ao salvar links eSports: {e}")
        return jsonify({"error": "Erro interno ao salvar links eSports."}), 500

# Rota para obter um perfil (opcional, útil para verificar/depurar)
@bp.route('/profile/<cpf>', methods=['GET'])
def get_profile(cpf):
    profile = FanProfile.query.filter_by(cpf=cpf).first()
    if not profile:
        return jsonify({"error": "Perfil não encontrado."}), 404
    return jsonify(profile.to_dict()), 200