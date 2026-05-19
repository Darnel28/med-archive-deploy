import React, { useState, useEffect } from 'react';

const TopbarAccueil = ({ isDarkMode, onToggleDarkMode, onToggleSidebar }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const mainContent = document.querySelector('.content');
    if (!mainContent) return;

    const handleScroll = () => {
      setIsScrolled(mainContent.scrollTop > 20);
    };

    mainContent.addEventListener('scroll', handleScroll);
    return () => mainContent.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`topbar ${isScrolled ? 'scrolled' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="icon-btn" id="sidebarToggle" aria-label="Toggle sidebar" onClick={onToggleSidebar}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="brand">MedArchive</div>
      </div>
      <div className="top-actions">
        <button className="icon-btn" aria-label="Langue">
          <i className="fa-solid fa-flag-usa"></i>
        </button>
        <button 
          className="icon-btn" 
          id="darkModeToggle" 
          aria-label="Mode nuit" 
          aria-pressed={isDarkMode}
          onClick={onToggleDarkMode}
        >
          <i className={isDarkMode ? "fa-regular fa-sun" : "fa-regular fa-moon"}></i>
        </button>
        <button className="icon-btn has-badge" aria-label="Notifications messages">
          <i className="fa-regular fa-envelope"></i>
          <span className="badge">5</span>
        </button>
        <button className="icon-btn has-badge" aria-label="Notifications alerte">
          <i className="fa-regular fa-bell"></i>
          <span className="badge">4</span>
        </button>
        <div className="profile">
          <img src="https://i.pravatar.cc/80?img=12" alt="Profil" />
          <div>
            <strong>BAH Konie</strong>
            <span>IMU: 24P-001</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopbarAccueil;