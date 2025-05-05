// frontend-web/src/services/api.js (Versão CORRETA usando Variável de Ambiente)
import axios from 'axios';

// 1. Lê a URL base da variável de ambiente VITE_API_BASE_URL definida no Vercel/local.
// 2. Se a variável não estiver definida (ex: rodando localmente sem .env),
//    usa 'http://localhost:5000/api' como fallback.
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Log para depuração: Mostra qual URL está sendo usada no console do navegador.
// Verifique isso no console do navegador quando acessar o site no Vercel.
console.log("API Base URL being used:", API_URL);

// Cria a instância do Axios com a URL base definida acima.
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json', // Header padrão para a maioria das requisições
  },
});

// --- Funções para interagir com a API ---

/**
 * Cria ou atualiza os dados básicos do perfil.
 * @param {object} profileData - Dados do formulário
 * @returns {Promise<object>} - Resposta da API
 */
export const saveProfileData = (profileData) => {
  console.log("Sending profile data to:", `${API_URL}/profile`); // Log da URL completa
  return apiClient.post('/profile', profileData);
};

/**
 * Envia o arquivo de documento para o backend.
 * @param {string} cpf - CPF do perfil associado.
 * @param {File} file - O arquivo a ser enviado.
 * @returns {Promise<object>} - Resposta da API
 */
export const uploadDocument = (cpf, file) => {
  const formData = new FormData();
  formData.append('document', file); // Nome do campo esperado pelo Flask
  const uploadUrl = `/profile/${cpf}/upload_document`;
  console.log("Uploading document to:", `${API_URL}${uploadUrl}`); // Log da URL completa

  return apiClient.post(uploadUrl, formData, {
    headers: {
      // Axios define Content-Type como multipart/form-data automaticamente
      // quando o dado é uma instância de FormData.
      // Não precisa definir manualmente aqui geralmente.
    },
  });
};

/**
 * Envia os links de redes sociais.
 * @param {string} cpf - CPF do perfil associado.
 * @param {object} socialLinks - Objeto com os links
 * @returns {Promise<object>} - Resposta da API
 */
export const saveSocialLinks = (cpf, socialLinks) => {
  const url = `/profile/${cpf}/link_social`;
  console.log("Sending social links to:", `${API_URL}${url}`); // Log da URL completa
  return apiClient.post(url, socialLinks);
};

/**
 * Envia os links de perfis eSports.
 * @param {string} cpf - CPF do perfil associado.
 * @param {object} esportsLinks - Objeto com os links
 * @returns {Promise<object>} - Resposta da API
 */
export const saveEsportsLinks = (cpf, esportsLinks) => {
  const url = `/profile/${cpf}/link_esports`;
  console.log("Sending eSports links to:", `${API_URL}${url}`); // Log da URL completa
  return apiClient.post(url, esportsLinks);
};

/**
 * Obtém os dados de um perfil pelo CPF.
 * @param {string} cpf - CPF do perfil.
 * @returns {Promise<object>} - Resposta da API com os dados do perfil.
 */
export const getProfile = (cpf) => {
  const url = `/profile/${cpf}`;
  console.log("Getting profile from:", `${API_URL}${url}`); // Log da URL completa
  return apiClient.get(url);
}

// Exporta a instância configurada do Axios
export default apiClient;