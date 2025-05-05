// frontend-web/src/App.jsx (Completo com abertura do chat)
import React, { useState, useEffect } from 'react';

// Importações da aplicação
import './App.css';
import {
  saveProfileData,
  uploadDocument,
  saveSocialLinks,
  saveEsportsLinks,
  getProfile
} from './services/api';

// Importações do Header e Logo
import Header from './components/Header/Header.jsx';
import furiaLogo from './assets/img/logo-furia.svg'; // Ajuste se necessário

function App() {
  // --- Estados ---
  const [formData, setFormData] = useState({
    full_name: '', address: '', cpf: '', interests: '',
    activities_last_year: '', events_last_year: '', purchases_last_year: '',
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [socialLinks, setSocialLinks] = useState({ twitter: '', instagram: '', twitch: '' });
  const [esportsLinks, setEsportsLinks] = useState({ hltv: '', faceit: '', gametracker: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [theme, setTheme] = useState('light');

  // --- Funções ---
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Handler para campos de texto básicos (com limpeza de estado no change do CPF)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    if (name === 'cpf') {
      setFormData(prevData => ({
          cpf: value, full_name: '', address: '', interests: '',
          activities_last_year: '', events_last_year: '', purchases_last_year: '',
      }));
      setSocialLinks({ twitter: '', instagram: '', twitch: '' });
      setEsportsLinks({ hltv: '', faceit: '', gametracker: '' });
      setDocumentFile(null);
      setCurrentProfile(null);
      clearMessages();
    }
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks(prevLinks => ({ ...prevLinks, [name]: value }));
  };

  const handleEsportsLinkChange = (e) => {
    const { name, value } = e.target;
    setEsportsLinks(prevLinks => ({ ...prevLinks, [name]: value }));
  };

  const handleFileChange = (e) => {
    setDocumentFile(e.target.files[0]);
  };

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  // Função de Submissão (async) - MODIFICADA PARA ABRIR O CHAT
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!formData.cpf) {
      setError("O CPF é obrigatório para salvar qualquer informação.");
      return;
    }
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
        setError("Formato do CPF inválido antes de salvar. Use XXX.XXX.XXX-XX");
        return;
    }

    setLoading(true);

    // Verificação de links da Furia ANTES de salvar
    let detectedFuriaLink = false;
    const linksToCheck = Object.values(esportsLinks);
    for (const url of linksToCheck) {
        if (url && url.toLowerCase().includes("furia")) {
            detectedFuriaLink = true;
            console.log("Link da Furia detectado na URL:", url); // Log para depuração
            break;
        }
    }

    try {
      // 1. Salvar/Atualizar dados básicos
      const profileResponse = await saveProfileData(formData);
      // Inicia a mensagem com o resultado do perfil
      let successMessage = `Perfil ${profileResponse.data.message}. `;
      const updatedProfile = profileResponse.data.profile;
      setCurrentProfile(updatedProfile); // Atualiza o perfil local

      // 2. Fazer upload do documento se selecionado
      if (documentFile) {
        const uploadResponse = await uploadDocument(formData.cpf, documentFile);
        successMessage += ` ${uploadResponse.data.message}.`; // Concatena resultado do upload
        setCurrentProfile(prev => ({...prev, document_path: uploadResponse.data.file_path, document_validated: uploadResponse.data.validated }));
        setDocumentFile(null); // Limpa o arquivo selecionado
      }

      // 3. Salvar links sociais
      const validSocialLinks = Object.fromEntries(Object.entries(socialLinks).filter(([_, v]) => v && v.trim() !== ''));
      if (Object.keys(validSocialLinks).length > 0) {
          const socialResponse = await saveSocialLinks(formData.cpf, validSocialLinks);
          successMessage += ` ${socialResponse.data.message}.`; // Concatena resultado
          setCurrentProfile(prev => ({...prev, social_media_links: socialResponse.data.profile.social_media_links }));
      }

      // 4. Salvar links eSports
      const validEsportsLinks = Object.fromEntries(Object.entries(esportsLinks).filter(([_, v]) => v && v.trim() !== ''));
       if (Object.keys(validEsportsLinks).length > 0) {
           const esportsResponse = await saveEsportsLinks(formData.cpf, validEsportsLinks);
           // Adiciona detalhes da validação à mensagem
           successMessage += ` ${esportsResponse.data.message}. Detalhes validação: ${JSON.stringify(esportsResponse.data.validation_results)}.`;
           setCurrentProfile(prev => ({...prev, esports_profile_links: esportsResponse.data.profile.esports_profile_links, esports_links_validated: esportsResponse.data.profile.esports_links_validated }));
       }

      // Define a mensagem de sucesso acumulada
      setMessage(successMessage);

      // Abrir chat se link da Furia foi detectado APÓS salvar tudo com sucesso
      if (detectedFuriaLink) {
        setMessage(prev => prev + " Link da FURIA detectado, abrindo chat..."); // Adiciona à mensagem existente
        console.log("Abrindo chat da Furia..."); // Log para depuração
        // Adiciona um pequeno delay para o usuário ler a mensagem antes de abrir a aba
        setTimeout(() => {
           window.open('https://chat-fan-28w2.vercel.app/', '_blank', 'noopener,noreferrer'); // Adiciona rel para segurança
         }, 1500); // Atraso de 1.5 segundos
      }

    } catch (err) { // Tratamento de erro
      console.error("Erro ao salvar:", err);
      const errorMsg = err.response?.data?.error || err.message || "Ocorreu um erro desconhecido.";
      setError(`Falha ao salvar: ${errorMsg}`);
      setMessage(''); // Limpa mensagem de sucesso se houve erro
    } finally { // Executa sempre ao final
      setLoading(false);
    }
  }; // --- Fim do handleSubmit ---

  // Função para carregar perfil ao sair do campo CPF
  const handleCpfBlur = async () => {
    if (formData.cpf && /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
        clearMessages();
        setLoading(true);
        try {
            const response = await getProfile(formData.cpf);
            const profile = response.data;
            setCurrentProfile(profile);
            setFormData({
                full_name: profile.full_name || '', address: profile.address || '', cpf: profile.cpf,
                interests: profile.interests || '', activities_last_year: profile.activities_last_year || '',
                events_last_year: profile.events_last_year || '', purchases_last_year: profile.purchases_last_year || '',
            });
             try { setSocialLinks(profile.social_media_links ? JSON.parse(profile.social_media_links) : { twitter: '', instagram: '', twitch: '' }); }
             catch (e) { console.error("Parse social links error", e); setSocialLinks({ twitter: '', instagram: '', twitch: '' });}
             try { setEsportsLinks(profile.esports_profile_links ? JSON.parse(profile.esports_profile_links) : { hltv: '', faceit: '', gametracker: '' }); }
             catch (e) { console.error("Parse esports links error", e); setEsportsLinks({ hltv: '', faceit: '', gametracker: '' }); }
             setMessage("Perfil carregado. Você pode editar os dados.");
        } catch (err) {
            if (err.response?.status === 404) {
                setMessage("CPF não encontrado. Um novo perfil será criado ao salvar.");
                setFormData(prev => ({ cpf: prev.cpf, full_name: '', address: '', interests: '', activities_last_year: '', events_last_year: '', purchases_last_year: '' }));
                setSocialLinks({ twitter: '', instagram: '', twitch: '' });
                setEsportsLinks({ hltv: '', faceit: '', gametracker: '' });
                setDocumentFile(null);
                setCurrentProfile(null);
            } else {
                setError("Erro ao buscar perfil: " + (err.response?.data?.error || err.message));
                 setCurrentProfile(null);
            }
        } finally { setLoading(false); }
    } else if (formData.cpf && formData.cpf.length >= 14) {
         setError("Formato do CPF inválido. Use XXX.XXX.XXX-XX");
         setCurrentProfile(null); clearMessages();
    } else if (!formData.cpf) {
         setCurrentProfile(null); clearMessages(); setError(''); // Limpa erro de formato também
    }
  }; // --- Fim do handleCpfBlur ---


  // --- Renderização ---
  return (
    <>
      <Header
        logoSrc={furiaLogo}
        theme={theme}
        toggleTheme={toggleTheme}
        currentRoom={null}
      />
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
            <input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleInputChange} onBlur={handleCpfBlur} placeholder="123.456.789-00" required maxLength="14" pattern="\d{3}\.\d{3}\.\d{3}-\d{2}" title="Formato esperado: 123.456.789-00" />
            {currentProfile && <span className='status'>✅ Carregado</span>}
          </div>
          <div className="form-group">
            <label htmlFor="full_name">Nome Completo:</label>
            <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange}/>
          </div>
          <div className="form-group">
            <label htmlFor="address">Endereço:</label>
            <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange}/>
          </div>
          <div className="form-group">
            <label htmlFor="interests">Seus Interesses (jogos, etc):</label>
            <textarea id="interests" name="interests" value={formData.interests} onChange={handleInputChange} rows="3" placeholder="Ex: CS:GO, LoL, assistir streams, colecionar itens..."/>
          </div>
          <div className="form-group">
            <label htmlFor="activities_last_year">Atividades Relacionadas (último ano):</label>
            <textarea id="activities_last_year" name="activities_last_year" value={formData.activities_last_year} onChange={handleInputChange} rows="3" placeholder="Ex: Assisti todos os jogos da FURIA no Major, participei de campeonato amador..."/>
          </div>
          <div className="form-group">
            <label htmlFor="events_last_year">Eventos que Participou/Assistiu (último ano):</label>
            <textarea id="events_last_year" name="events_last_year" value={formData.events_last_year} onChange={handleInputChange} rows="3" placeholder="Ex: Fui na BGS 2024, assisti a final do CBLOL 2024.2..."/>
          </div>
          <div className="form-group">
              <label htmlFor="purchases_last_year">Compras Relacionadas (último ano):</label>
              <textarea id="purchases_last_year" name="purchases_last_year" value={formData.purchases_last_year} onChange={handleInputChange} rows="3" placeholder="Ex: Camisa oficial Furia 2024, Ingressos para evento X..."/>
            </div>

          {/* --- Seção Upload Documento --- */}
          <h2>Documento de Identificação (Upload)</h2>
          <div className="form-group">
            <label htmlFor="document">Selecione o arquivo (ID, CNH - PNG, JPG, PDF):</label>
            <input type="file" id="document" name="document" onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf"/>
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
          </div>

          {/* --- Seção Perfis eSports --- */}
          <h2>Perfis em Sites de eSports</h2>
          <p>(Informe as URLs completas dos seus perfis. Tentaremos validar a relevância)</p>
          <div className="form-group link-group">
            <label htmlFor="hltv">HLTV:</label>
            <input type="url" id="hltv" name="hltv" value={esportsLinks.hltv || ''} onChange={handleEsportsLinkChange} placeholder="https://www.hltv.org/profile/..." />
            <label htmlFor="faceit">FACEIT:</label>
            <input type="url" id="faceit" name="faceit" value={esportsLinks.faceit || ''} onChange={handleEsportsLinkChange} placeholder="https://www.faceit.com/pt/players/..." />
            <label htmlFor="gametracker">GameTracker/Outro:</label>
            <input type="url" id="gametracker" name="gametracker" value={esportsLinks.gametracker || ''} onChange={handleEsportsLinkChange} placeholder="Link para outro perfil relevante" />
            {currentProfile?.esports_profile_links &&
                <span className='status'>
                    Status Validação Links: {currentProfile.esports_links_validated ? '✅ OK' : '⚠️ Falha/Pendente'}
                </span>
            }
          </div>

          {/* --- Botão de Envio --- */}
          <button type="submit" disabled={loading || !formData.cpf}>
            {loading ? 'Salvando...' : 'Salvar Informações'}
          </button>
        </form>

        {/* --- Resumo do Perfil (Opcional) --- */}
        {currentProfile && (
          <div className="profile-summary">
            <h3>Resumo do Perfil Salvo/Carregado</h3>
            <pre>{JSON.stringify(currentProfile, null, 2)}</pre>
          </div>
        )}
      </div> {/* Fim da div .App */}
    </> // Fim do Fragment
  );
}

export default App;