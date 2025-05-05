// frontend/src/services/api.js
import axios from 'axios';

// URL base da sua API Flask (ajuste se necessário)
const API_URL = 'https://know-your-fan-app-u87d.onrender.com/api'; // Certifique-se que o backend está rodando nesta porta

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Funções para interagir com a API ---

/**
 * Cria ou atualiza os dados básicos do perfil.
 * @param {object} profileData - Dados do formulário (name, address, cpf, interests, etc.)
 * @returns {Promise<object>} - Resposta da API
 */
export const saveProfileData = (profileData) => {
  return apiClient.post('/profile', profileData);
};

/**
 * Envia o arquivo de documento para o backend.
 * @param {string} cpf - CPF do perfil associado.
 * * @param {File} file - O arquivo a ser enviado.
 * @returns {Promise<object>} - Resposta da API
 */
export const uploadDocument = (cpf, file) => {
  const formData = new FormData();
  formData.append('document', file); // 'document' deve ser o mesmo nome esperado no Flask

  return apiClient.post(`/profile/${cpf}/upload_document`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Importante para envio de arquivos
    },
  });
};

/**
 * Envia os links de redes sociais.
 * @param {string} cpf - CPF do perfil associado.
 * @param {object} socialLinks - Objeto com os links (ex: { twitter: 'url', instagram: 'url' })
 * @returns {Promise<object>} - Resposta da API
 */
export const saveSocialLinks = (cpf, socialLinks) => {
  return apiClient.post(`/profile/${cpf}/link_social`, socialLinks);
};

/**
 * Envia os links de perfis eSports.
 * @param {string} cpf - CPF do perfil associado.
 * @param {object} esportsLinks - Objeto com os links (ex: { hltv: 'url', faceit: 'url' })
 * @returns {Promise<object>} - Resposta da API
 */
export const saveEsportsLinks = (cpf, esportsLinks) => {
  return apiClient.post(`/profile/${cpf}/link_esports`, esportsLinks);
};

/**
 * Obtém os dados de um perfil pelo CPF (opcional, para carregar dados existentes).
 * @param {string} cpf - CPF do perfil.
 * @returns {Promise<object>} - Resposta da API com os dados do perfil.
 */
export const getProfile = (cpf) => {
    return apiClient.get(`/profile/${cpf}`);
}

export default apiClient; // Pode exportar o cliente configurado também