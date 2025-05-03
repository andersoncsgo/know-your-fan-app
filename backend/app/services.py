import os
import requests # Importa a biblioteca requests
from bs4 import BeautifulSoup # Importa a biblioteca BeautifulSoup
from flask import current_app


def validate_document_with_ai(file_path):
    """
    Placeholder para validação de documento usando AI.
    - Recebe o caminho do arquivo.
    - Deveria:
        1. Chamar uma API de OCR/Identificação (ex: Google Vision AI, AWS Rekognition).
        2. Analisar a resposta da API para verificar se é um documento válido
           e extrair informações (nome, CPF) para possível cruzamento.
        3. Retornar True se validado, False caso contrário.
    - Retorna True por padrão para fins de prototipagem.
    """
    current_app.logger.info(f"AI PLACEHOLDER: Validando documento em {file_path}")
    # --- LÓGICA REAL DA AI AQUI ---
    # Exemplo (pseudo-código):
    # try:
    #     client = vision.ImageAnnotatorClient() # Exemplo Google Vision
    #     with open(file_path, 'rb') as image_file:
    #         content = image_file.read()
    #     image = vision.Image(content=content)
    #     response = client.text_detection(image=image)
    #     texts = response.text_annotations
    #     if texts:
    #         # Analisar 'texts' para verificar se é um doc válido (RG, CNH, etc.)
    #         current_app.logger.info("AI: Documento parece conter texto.")
    #         return True # Simplificado
    #     else:
    #         current_app.logger.warning("AI: Documento não parece conter texto.")
    #         return False
    # except Exception as e:
    #     current_app.logger.error(f"AI Error: {e}")
    #     return False
    # -----------------------------
    return True # Retorno padrão do placeholder



# ... (mantenha as outras funções como validate_document_with_ai e allowed_file) ...

def validate_esports_link_relevance(profile_url):
    """
    Tenta validar a relevância de um link de perfil eSports usando
    web scraping básico e análise de palavras-chave.

    NOTA: Esta abordagem tem limitações significativas:
    - Pode ser bloqueada por sites (anti-scraping, Cloudflare).
    - É frágil a mudanças no HTML do site de destino.
    - Pode violar Termos de Serviço (use com responsabilidade e moderação).
    - A precisão é limitada pela análise de palavras-chave.
    """
    current_app.logger.info(f"Attempting basic keyword relevance check for URL: {profile_url}")

    # --- Lista de Palavras-chave (ajuste conforme necessário) ---
    # Converta tudo para minúsculas para comparação case-insensitive
    KEYWORDS = [
        "furia", "esports", "e-sports", "csgo", "cs:go", "counter-strike",
        "valorant", "league of legends", "lol", "player", "jogador", "team",
        "time", "stats", "statistics", "estatisticas", "ranking", "match",
        "partida", "hltv", "faceit", "gamers club", "challengermode",
        "steam", "twitch", "streamer", "pro player",
        # Nomes de jogadores atuais/icônicos (cuidado para não serem comuns demais)
        "art", "fallen", "kscerato", "yuurih", "guerri"
    ]
    # Quantas palavras-chave precisam ser encontradas para considerar relevante?
    MIN_KEYWORD_THRESHOLD = 2

    headers = {
        # Simula um navegador comum para reduzir chance de bloqueio inicial
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7', # Indica preferência por inglês ou português
        'Connection': 'keep-alive'
    }
    timeout_seconds = 10 # Define um tempo limite para a requisição

    try:
        # Faz a requisição GET para a URL
        response = requests.get(profile_url, headers=headers, timeout=timeout_seconds, allow_redirects=True)

        # Verifica se a requisição foi bem-sucedida (status code 2xx)
        # Levanta um erro para códigos 4xx (erro do cliente) ou 5xx (erro do servidor)
        response.raise_for_status()

        # Analisa o conteúdo HTML da página
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extrai todo o texto visível da página e converte para minúsculas
        # Usar .get_text() é simples, mas pega muito "ruído". Poderia ser refinado
        # para pegar só o body, ou tags específicas como <title>, <meta description>.
        page_text = soup.get_text().lower()

        if not page_text:
             current_app.logger.warning(f"No text extracted from {profile_url}")
             return False

        # Conta quantas palavras-chave foram encontradas
        found_keywords_count = 0
        found_list = [] # Para logar quais keywords foram achadas
        for keyword in KEYWORDS:
            # Verifica a presença da palavra inteira ou como parte de outra
            # Poderia ser melhorado usando regex para palavras completas (\bkeyword\b)
            if keyword in page_text:
                found_keywords_count += 1
                found_list.append(keyword)

        current_app.logger.info(f"Keyword check for {profile_url}: Found {found_keywords_count} keywords - {found_list}")

        # Verifica se o número de palavras-chave encontradas atinge o limite mínimo
        if found_keywords_count >= MIN_KEYWORD_THRESHOLD:
            current_app.logger.info(f"Link {profile_url} deemed RELEVANT based on keywords.")
            return True
        else:
            current_app.logger.info(f"Link {profile_url} deemed NOT relevant (keyword count < {MIN_KEYWORD_THRESHOLD}).")
            return False

    except requests.exceptions.Timeout:
        current_app.logger.warning(f"Timeout occurred while fetching {profile_url}")
        return False
    except requests.exceptions.TooManyRedirects:
         current_app.logger.warning(f"Too many redirects for {profile_url}")
         return False
    except requests.exceptions.RequestException as e:
        # Captura outros erros de requisição (DNS, conexão, HTTPError de raise_for_status)
        current_app.logger.error(f"Error fetching or processing {profile_url}: {e}")
        return False
    except Exception as e:
        # Captura erros inesperados (ex: erro no BeautifulSoup)
        current_app.logger.error(f"Unexpected error during validation of {profile_url}: {e}")
        return False

def allowed_file(filename):
    """Verifica se a extensão do arquivo é permitida."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']