import React, { useState, useEffect } from 'react';
import { getAuthUser } from '../../api/client';
import AvatarInitials from '../AvatarInitials.jsx';
import Chart from '../Chart.jsx';

const TopbarAdmin = ({ isDarkMode, onToggleDarkMode, onToggleSidebar }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showChart, setShowChart] = useState(false);

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
        <button className="icon-btn has-badge" aria-label="Notifications messages" onClick={() => setShowChart(true)}>
          <i className="fa-regular fa-envelope"></i>
          <span className="badge">5</span>
        </button>
        <button className="icon-btn has-badge" aria-label="Notifications alerte">
          <i className="fa-regular fa-bell"></i>
          <span className="badge">4</span>
        </button>
        {(() => {
          const auth = getAuthUser() || {};
          const user = auth.user || auth;
          const name = user.name || 'Administrateur';
          const role = user.role?.nom || auth.role?.nom || 'Administrateur';
          const avatar = user.avatar || auth.avatar || null;

          return (
            <div className="profile">
              {avatar ? (
                <img src={avatar} alt="Profil administrateur" />
              ) : (
                <AvatarInitials name={name} size={45} bgColor="#13c3b8" />
              )}
              <div>
                <strong>{name}</strong>
                <span>{role}</span>
              </div>
            </div>
          );
        })()}
      </div>
      {showChart && (
        <div className="chart-modal-backdrop" onClick={() => setShowChart(false)}>
          <div className="chart-modal" onClick={e => e.stopPropagation()}>
            <button className="chart-modal-close" onClick={() => setShowChart(false)}>×</button>
            <Chart />
          </div>
        </div>
      )}
    </header>
  );
};

export default TopbarAdmin;
