// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css'; // Garanta que este arquivo CSS existe e contém os estilos
import {
  saveProfileData,
  uploadDocument,
  saveSocialLinks,
  saveEsportsLinks,
  getProfile // Para carregar dados existentes (opcional)
} from './services/api'; // Certifique-se que api.js está em src/services/

function App() {
  // Estado para os dados do formulário
  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    cpf: '', // Chave principal
    interests: '',
    activities_last_year: '',
    events_last_year: '',
    purchases_last_year: '',
  });

  const [documentFile, setDocumentFile] = useState(null);
  const [socialLinks, setSocialLinks] = useState({ twitter: '', instagram: '', twitch: '' });
  const [esportsLinks, setEsportsLinks] = useState({ hltv: '', faceit: '', gametracker: '' }); // Exemplo

  // Estado para feedback ao usuário
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null); // Guarda o perfil retornado/carregado

  // Handler para campos de texto básicos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handler para campos de links sociais
  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks({ ...socialLinks, [name]: value });
  }

   // Handler para campos de links esports
   const handleEsportsLinkChange = (e) => {
    const { name, value } = e.target;
    setEsportsLinks({ ...esportsLinks, [name]: value });
  }

  // Handler para seleção de arquivo
  const handleFileChange = (e) => {
    setDocumentFile(e.target.files[0]);
  };

  // Função para limpar mensagens
  const clearMessages = () => {
    setMessage('');
    setError('');
  }

  // Função para submeter TUDO (pode ser separado)
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!formData.cpf) {
      setError("O CPF é obrigatório para salvar qualquer informação.");
      return;
    }
    setLoading(true);

    try {
      // 1. Salvar/Atualizar dados básicos
      const profileResponse = await saveProfileData(formData);
      setMessage(`Perfil ${profileResponse.data.message}. `);
      const updatedProfile = profileResponse.data.profile;
      setCurrentProfile(updatedProfile); // Armazena o perfil atualizado

      // 2. Fazer upload do documento se selecionado
      if (documentFile) {
        const uploadResponse = await uploadDocument(formData.cpf, documentFile);
        setMessage(prev => prev + ` ${uploadResponse.data.message}.`);
        // Atualizar estado local se necessário (ex: caminho do doc, status validado)
        setCurrentProfile(prev => ({...prev, document_path: uploadResponse.data.file_path, document_validated: uploadResponse.data.validated }));
      }

      // 3. Salvar links sociais (remover vazios antes de enviar)
      const validSocialLinks = Object.fromEntries(Object.entries(socialLinks).filter(([_, v]) => v && v.trim() !== ''));
      if (Object.keys(validSocialLinks).length > 0) {
          const socialResponse = await saveSocialLinks(formData.cpf, validSocialLinks);
          setMessage(prev => prev + ` ${socialResponse.data.message}.`);
          setCurrentProfile(prev => ({...prev, social_media_links: socialResponse.data.profile.social_media_links }));
      }

      // 4. Salvar links eSports (remover vazios antes de enviar)
      const validEsportsLinks = Object.fromEntries(Object.entries(esportsLinks).filter(([_, v]) => v && v.trim() !== ''));
       if (Object.keys(validEsportsLinks).length > 0) {
           const esportsResponse = await saveEsportsLinks(formData.cpf, validEsportsLinks);
           setMessage(prev => prev + ` ${esportsResponse.data.message}. Detalhes validação: ${JSON.stringify(esportsResponse.data.validation_results)}.`);
            setCurrentProfile(prev => ({...prev, esports_profile_links: esportsResponse.data.profile.esports_profile_links, esports_links_validated: esportsResponse.data.profile.esports_links_validated }));
       }

       // Opcional: Limpar formulário após sucesso total? Ou manter para edição?
       // setFormData({ ...initialFormData }); // Definir initialFormData
       // setDocumentFile(null);
       // setSocialLinks({...initialSocialLinks});
       // setEsportsLinks({...initialEsportsLinks});


    } catch (err) {
      console.error("Erro ao salvar:", err);
      const errorMsg = err.response?.data?.error || err.message || "Ocorreu um erro desconhecido.";
      setError(`Falha ao salvar: ${errorMsg}`);
      // Resetar apenas a mensagem de sucesso
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  // Opcional: Carregar perfil se um CPF for digitado e sair do campo
  const handleCpfBlur = async () => {
      if(formData.cpf && formData.cpf.length === 14) { // Formato XXX.XXX.XXX-XX
        clearMessages();
        setLoading(true);
        try {
            const response = await getProfile(formData.cpf);
            const profile = response.data;
            setCurrentProfile(profile);
            // Preencher formulário com dados existentes
            setFormData({
                full_name: profile.full_name || '',
                address: profile.address || '',
                cpf: profile.cpf, // Manter o CPF digitado
                interests: profile.interests || '',
                activities_last_year: profile.activities_last_year || '',
                events_last_year: profile.events_last_year || '',
                purchases_last_year: profile.purchases_last_year || '',
            });
            // Preencher links (parseando o JSON armazenado como string, com tratamento de erro)
            try {
                setSocialLinks(profile.social_media_links ? JSON.parse(profile.social_media_links) : { twitter: '', instagram: '', twitch: '' });
            } catch (parseError) {
                console.error("Erro ao parsear social_media_links:", parseError);
                setSocialLinks({ twitter: '', instagram: '', twitch: '' }); // Reset em caso de erro
            }
            try {
                setEsportsLinks(profile.esports_profile_links ? JSON.parse(profile.esports_profile_links) : { hltv: '', faceit: '', gametracker: '' });
            } catch (parseError) {
                 console.error("Erro ao parsear esports_profile_links:", parseError);
                 setEsportsLinks({ hltv: '', faceit: '', gametracker: '' }); // Reset em caso de erro
            }

            setMessage("Perfil carregado. Você pode editar os dados.");
        } catch (err) {
            if (err.response?.status === 404) {
                setMessage("CPF não encontrado. Um novo perfil será criado ao salvar.");
                // Resetar campos caso não encontre, exceto CPF
                setFormData(prev => ({ cpf: prev.cpf, full_name: '', address: '', interests: '', activities_last_year: '', events_last_year: '', purchases_last_year: '' }));
                setSocialLinks({ twitter: '', instagram: '', twitch: '' });
                setEsportsLinks({ hltv: '', faceit: '', gametracker: '' });
                setCurrentProfile(null);
            } else {
                setError("Erro ao buscar perfil: " + (err.response?.data?.error || err.message));
            }
        } finally {
            setLoading(false);
        }
      }
  }


  return (
    <div className="App">
      <h1>Know Your Fan - FURIA</h1>
      <p>Preencha o máximo de informações sobre você como fã!</p>

      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}
      {loading && <div className="message loading">Processando...</div>}

      <form onSubmit={handleSubmit} className="profile-form">

        {/* --- Seção Dados Básicos --- */}
        <h2>Dados Básicos</h2>
        <div className="form-group">
          <label htmlFor="cpf">CPF * (chave única):</label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleInputChange}
            onBlur={handleCpfBlur} // Carrega dados ao sair do campo
            placeholder="123.456.789-00"
            required
            maxLength="14"
            pattern="\d{3}\.\d{3}\.\d{3}-\d{2}" // Adiciona um padrão básico para o formato
            title="Formato esperado: 123.456.789-00"
          />
           {currentProfile && <span className='status'>✅ Carregado</span>}
        </div>
        <div className="form-group">
          <label htmlFor="full_name">Nome Completo:</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
          />
        </div>
         <div className="form-group">
          <label htmlFor="address">Endereço:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
           <label htmlFor="interests">Seus Interesses (jogos, etc):</label>
           <textarea
             id="interests"
             name="interests"
             value={formData.interests}
             onChange={handleInputChange}
             rows="3"
             placeholder="Ex: CS:GO, LoL, assistir streams, colecionar itens..."
           />
         </div>
         <div className="form-group">
           <label htmlFor="activities_last_year">Atividades Relacionadas (último ano):</label>
           <textarea
             id="activities_last_year"
             name="activities_last_year"
             value={formData.activities_last_year}
             onChange={handleInputChange}
             rows="3"
              placeholder="Ex: Assisti todos os jogos da FURIA no Major, participei de campeonato amador..."
           />
         </div>
          <div className="form-group">
            <label htmlFor="events_last_year">Eventos que Participou/Assistiu (último ano):</label>
            <textarea
              id="events_last_year"
              name="events_last_year"
              value={formData.events_last_year}
              onChange={handleInputChange}
              rows="3"
              placeholder="Ex: Fui na BGS 2024, assisti a final do CBLOL 2024.2..."
            />
          </div>
          <div className="form-group">
             <label htmlFor="purchases_last_year">Compras Relacionadas (último ano):</label>
             <textarea
               id="purchases_last_year"
               name="purchases_last_year"
               value={formData.purchases_last_year}
               onChange={handleInputChange}
               rows="3"
               placeholder="Ex: Camisa oficial Furia 2024, Ingressos para evento X..."
             />
           </div>

         {/* --- Seção Upload Documento --- */}
         <h2>Documento de Identificação (Upload)</h2>
          <div className="form-group">
             <label htmlFor="document">Selecione o arquivo (ID, CNH - PNG, JPG, PDF):</label>
             <input
               type="file"
               id="document"
               name="document"
               onChange={handleFileChange}
               accept=".png,.jpg,.jpeg,.pdf"
             />
             {documentFile && <span>Arquivo selecionado: {documentFile.name}</span>}
             {currentProfile?.document_path && !documentFile &&
                <span className='status'>
                    Documento anterior enviado. Status Validação (AI Placeholder): {currentProfile.document_validated ? '✅ Validado' : '❌ Não Validado'}
                </span>
             }
           </div>

         {/* --- Seção Redes Sociais --- */}
         <h2>Redes Sociais</h2>
         <p>(Informe as URLs completas dos seus perfis)</p>
         <div className="form-group link-group">
            <label htmlFor="twitter">Twitter:</label>
             <input type="url" id="twitter" name="twitter" value={socialLinks.twitter || ''} onChange={handleSocialLinkChange} placeholder="https://twitter.com/seu_usuario"/>
             <label htmlFor="instagram">Instagram:</label>
             <input type="url" id="instagram" name="instagram" value={socialLinks.instagram || ''} onChange={handleSocialLinkChange} placeholder="https://instagram.com/seu_usuario"/>
             <label htmlFor="twitch">Twitch:</label>
             <input type="url" id="twitch" name="twitch" value={socialLinks.twitch || ''} onChange={handleSocialLinkChange} placeholder="https://twitch.tv/seu_canal"/>
             {/* Adicione mais redes se necessário */}
         </div>

         {/* --- Seção Perfis eSports --- */}
         <h2>Perfis em Sites de eSports</h2>
         <p>(Informe as URLs completas dos seus perfis. Tentaremos validar a relevância com AI)</p>
          <div className="form-group link-group">
              <label htmlFor="hltv">HLTV:</label>
              <input type="url" id="hltv" name="hltv" value={esportsLinks.hltv || ''} onChange={handleEsportsLinkChange} placeholder="https://www.hltv.org/profile/..." />
              <label htmlFor="faceit">FACEIT:</label>
              <input type="url" id="faceit" name="faceit" value={esportsLinks.faceit || ''} onChange={handleEsportsLinkChange} placeholder="https://www.faceit.com/pt/players/..." />
              <label htmlFor="gametracker">GameTracker/Outro:</label>
              <input type="url" id="gametracker" name="gametracker" value={esportsLinks.gametracker || ''} onChange={handleEsportsLinkChange} placeholder="Link para outro perfil relevante" />
              {/* Adicione mais sites se necessário */}
               {currentProfile?.esports_profile_links &&
                   <span className='status'>
                      Status Validação Links (AI Placeholder): {currentProfile.esports_links_validated ? '✅ Todos Parecem Relevantes' : '⚠️ Alguns Podem Não Ser Relevantes'}
                   </span>
               }
          </div>

         {/* --- Botão de Envio --- */}
         <button type="submit" disabled={loading || !formData.cpf}>
           {loading ? 'Salvando...' : 'Salvar Informações'}
         </button>
       </form>

       {/* Opcional: Mostrar dados do perfil carregado/salvo */}
       {currentProfile && (
         <div className="profile-summary">
            <h3>Resumo do Perfil Salvo/Carregado</h3>
            <pre>{JSON.stringify(currentProfile, null, 2)}</pre>
         </div>
       )}

     </div>
   );
}

export default App;