# backend/app/services.py
import os
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

def validate_esports_link_relevance(profile_url):
    """
    Placeholder para validar a relevância de um link de perfil eSports usando AI.
    - Recebe a URL do perfil.
    - Deveria:
        1. (Opcional) Fazer web scraping da página (respeitando robots.txt e termos de serviço!).
        2. Analisar o conteúdo da página (ou metadados) usando um modelo de linguagem (LLM)
           ou NLP para determinar se o conteúdo é relacionado a eSports e/ou FURIA.
        3. Retornar True se relevante, False caso contrário.
    - Retorna True por padrão para fins de prototipagem.
    """
    current_app.logger.info(f"AI PLACEHOLDER: Validando relevância do link {profile_url}")
    # --- LÓGICA REAL DA AI AQUI ---
    # Exemplo (pseudo-código):
    # try:
    #     # 1. Scrape (usando requests/BeautifulSoup - CUIDADO COM LEGALIDADE/BLOQUEIOS)
    #     # response = requests.get(profile_url, timeout=10)
    #     # response.raise_for_status()
    #     # soup = BeautifulSoup(response.text, 'html.parser')
    #     # page_text = soup.get_text()
    #
    #     # 2. Análise com LLM (ex: OpenAI)
    #     # client = OpenAI(api_key=current_app.config['OPENAI_API_KEY'])
    #     # completion = client.chat.completions.create(
    #     #     model="gpt-3.5-turbo",
    #     #     messages=[
    #     #         {"role": "system", "content": "Você é um assistente que avalia se uma URL pertence a um perfil de jogador ou fã de eSports, especialmente relacionado à FURIA."},
    #     #         {"role": "user", "content": f"A URL '{profile_url}' parece ser relevante para eSports/FURIA? Responda apenas 'SIM' ou 'NAO'."}
    #     #     ]
    #     # )
    #     # response_text = completion.choices[0].message.content.strip().upper()
    #     # return response_text == 'SIM'
    #     return True # Simplificado
    # except Exception as e:
    #     current_app.logger.error(f"AI/Scraping Error: {e}")
    #     return False
    # -----------------------------
    return True # Retorno padrão do placeholder

def allowed_file(filename):
    """Verifica se a extensão do arquivo é permitida."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']