# backend/app/services.py (ATUALIZADO para analisar Title/Meta Tags)
import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from flask import current_app
import re

# --- FUNÇÃO 1: PLACEHOLDER PARA VALIDAÇÃO DE DOCUMENTO COM IA ---
def validate_document_with_ai(file_path):
    """
    Placeholder para validação de documento usando AI.
    Retorna True para simular sucesso no desafio.
    """
    current_app.logger.info(f"AI PLACEHOLDER: Attempting document validation for {file_path}")
    return True

# --- FUNÇÃO 2: PARA VALIDAR LINKS DE ESPORTS (MODIFICADA) ---
def validate_esports_link_relevance(profile_url):
    """
    Tenta validar a relevância de um link de perfil eSports.
    1. Checa keywords na URL.
    2. Se URL OK, tenta fazer scraping e analisa APENAS <title> e <meta name="description"> por keywords.
    Retorna True se o conteúdo (title/meta) for relevante, False caso contrário.
    """
    current_app.logger.info(f"Attempting relevance validation for URL: {profile_url}")

    # --- Etapa 1: Checagem da URL (sem mudanças) ---
    try:
        if not profile_url or not isinstance(profile_url, str) or not profile_url.startswith(('http://', 'https://')):
            current_app.logger.warning(f"Invalid or missing scheme in URL: {profile_url}")
            return False
        parsed_url = urlparse(profile_url)
        if not parsed_url.netloc:
             current_app.logger.warning(f"Invalid URL format (missing domain/netloc): {profile_url}")
             return False
        url_string_to_check = (parsed_url.netloc + parsed_url.path).lower()
        URL_KEYWORDS = [
            "hltv", "faceit", "steamcommunity", "challengermode", "op.gg",
            "twitch.tv", "gamersclub", "liquipedia", "furia", "player",
            "team", "profile", "stats", "user", "pro", "esports", "u", "id"
        ]
        url_seems_relevant = any(keyword in url_string_to_check for keyword in URL_KEYWORDS)
        if not url_seems_relevant:
            current_app.logger.info(f"URL '{profile_url}' deemed NOT relevant based on URL keywords.")
            return False
        current_app.logger.info(f"URL '{profile_url}' PASSED preliminary URL keyword check.")
    except Exception as url_e:
        current_app.logger.error(f"Error parsing URL '{profile_url}': {url_e}")
        return False

    # --- Etapa 2: Checagem do Conteúdo (Scraping - Focado em Title/Meta) ---
    try:
        headers = { # Headers para simular navegador
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
        }
        timeout_seconds = 10
        response = requests.get(profile_url, headers=headers, timeout=timeout_seconds, allow_redirects=True)
        response.raise_for_status()

        content_type = response.headers.get('content-type', '').lower()
        if 'html' not in content_type:
             current_app.logger.warning(f"Content type for '{profile_url}' is not HTML ({content_type}).")
             return False

        soup = BeautifulSoup(response.text, 'html.parser')

        # --- MODIFICAÇÃO PRINCIPAL: Extrair texto APENAS do Title e Meta Description ---
        page_text_to_analyze = "" # Inicializa string vazia

        # Extrai texto do <title>
        title_tag = soup.find('title')
        if title_tag:
            title_text = title_tag.get_text(separator=' ', strip=True).lower()
            page_text_to_analyze += title_text + " " # Adiciona à string de análise
            current_app.logger.debug(f"Extracted title text: '{title_text}'")

        # Extrai texto do <meta name="description">
        meta_desc_tag = soup.find('meta', attrs={'name': 'description'})
        # Verifica se a tag existe e tem o atributo 'content'
        if meta_desc_tag and meta_desc_tag.get('content'):
            meta_text = meta_desc_tag.get('content').lower()
            page_text_to_analyze += meta_text # Adiciona à string de análise
            current_app.logger.debug(f"Extracted meta description text: '{meta_text}'")
        # --- FIM DA MODIFICAÇÃO PRINCIPAL ---

        # Verifica se conseguimos extrair algum texto relevante
        if not page_text_to_analyze.strip():
             current_app.logger.warning(f"No text extracted from title/meta tags for '{profile_url}'.")
             return False

        # Lista de Keywords para procurar no conteúdo (title + meta)
        # Pode ser a mesma lista de antes, ou talvez um pouco mais focada
        CONTENT_KEYWORDS = [
            "furia", "esports", "e-sports", "csgo", "cs:go", "counter-strike",
            "valorant", "league of legends", "lol", "player", "jogador", "team",
            "time", "stats", "statistics", "estatisticas", "ranking", "match",
            "partida", "hltv", "faceit", "gamers club", "challengermode",
            "steam", "twitch", "streamer", "pro player", "professional player",
            "game", "jogo", "art", "fallen", "kscerato", "yuurih", "guerri", "gaules"
        ]
        # Talvez reduzir o threshold, já que estamos analisando menos texto?
        # Ou manter 2 para garantir mais relevância. Vamos manter 2 por enquanto.
        MIN_CONTENT_KEYWORD_THRESHOLD = 2
        found_keywords_count = 0
        found_list = []

        # Conta as keywords encontradas no texto combinado de title e meta
        for keyword in CONTENT_KEYWORDS:
            # Usando regex para palavras inteiras (mais preciso)
            if re.search(r'\b' + re.escape(keyword) + r'\b', page_text_to_analyze, re.IGNORECASE):
                 found_keywords_count += 1
                 found_list.append(keyword)

        current_app.logger.info(f"Title/Meta keyword check for '{profile_url}': Found {found_keywords_count} keywords - {found_list}")

        # Retorna True/False baseado na contagem
        if found_keywords_count >= MIN_CONTENT_KEYWORD_THRESHOLD:
            current_app.logger.info(f"Link '{profile_url}' CONFIRMED RELEVANT based on title/meta keywords.")
            return True
        else:
            current_app.logger.info(f"Link '{profile_url}' NOT confirmed relevant via title/meta (keyword count < {MIN_CONTENT_KEYWORD_THRESHOLD}).")
            return False

    # Tratamento de Erros do Scraping (sem mudanças)
    except requests.exceptions.Timeout:
        current_app.logger.warning(f"Timeout occurred while fetching content for '{profile_url}'")
        return False
    except requests.exceptions.TooManyRedirects:
         current_app.logger.warning(f"Too many redirects for '{profile_url}'")
         return False
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Failed to fetch/process content for '{profile_url}': {e}")
        return False
    except Exception as e:
        current_app.logger.error(f"Unexpected error during content validation of '{profile_url}': {e}")
        return False

# --- FUNÇÃO 3: PARA VERIFICAR EXTENSÃO DE ARQUIVO PERMITIDA ---
def allowed_file(filename):
    """Verifica se a extensão do arquivo está na lista de permissões."""
    if not filename or not isinstance(filename, str):
        return False
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config.get('ALLOWED_EXTENSIONS', set())