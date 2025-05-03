// frontend/src/components/Header/Header.jsx
import React from 'react';
import styles from './Header.module.css'; // Importa o CSS Module

// Recebe as props necessárias: logoSrc, theme, toggleTheme, currentRoom
function Header({ logoSrc, theme, toggleTheme, currentRoom }) {
  return (
    <header className={styles.header}>
      {/* Seção Esquerda: Mostra o nome da sala ou título padrão */}
      <div className={styles.headerLeft}>
        <span>{currentRoom ? `Sala: ${currentRoom}` : 'FURIA Know Your Fan'}</span> {/* Alterado título */}
      </div>

      {/* Seção Central: Logo */}
      <div className={styles.headerCenter}>
        <img src={logoSrc} alt="FURIA Logo" className={styles.logoImg} />
      </div>

      {/* Seção Direita: Botão de Tema */}
      <div className={styles.headerRight}>
        <button onClick={toggleTheme} className={styles.themeToggleButton} title="Alternar Tema">
          {/* Exibe o ícone correspondente ao tema atual */}
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        {/* Poderia adicionar outros ícones/botões aqui se necessário */}
      </div>
    </header>
  );
}

export default Header;