import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthUser } from '../../api/client';
import { getNotifications } from '../../api/notificationApi';
import AvatarInitials from '../AvatarInitials.jsx';
import Chart from '../Chart.jsx';
import { applyLanguage } from '../../utils/language.js';

function unwrapUser(auth) {
  return auth?.data?.user || auth?.user || auth || {};
}

export default function DashboardTopbar({
  isDarkMode,
  onToggleDarkMode,
  onToggleSidebar,
  notificationsPath,
  fallbackName = 'Utilisateur',
  fallbackRole = '',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('medarchive-language') || 'fr');
  const [showChart, setShowChart] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const user = unwrapUser(getAuthUser());
  const name = user.name || fallbackName;
  const role = user.role?.nom || user.role?.name || user.numero_professionnel || user.imu || fallbackRole;
  const avatar = user.avatar || null;

  useEffect(() => {
    const mainContent = document.querySelector('.content');
    if (!mainContent) return undefined;
    const handleScroll = () => setIsScrolled(mainContent.scrollTop > 20);
    mainContent.addEventListener('scroll', handleScroll);
    return () => mainContent.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => applyLanguage(language), 0);
    return () => window.clearTimeout(timer);
  }, [language, location.pathname]);

  useEffect(() => {
    let mounted = true;

    async function loadUnreadNotifications() {
      try {
        const response = await getNotifications({ unread: true, per_page: 1 });
        if (mounted) setUnreadNotifications(response?.unread_count ?? 0);
      } catch {
        if (mounted) setUnreadNotifications(0);
      }
    }

    loadUnreadNotifications();
    const timer = window.setInterval(loadUnreadNotifications, 15000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const toggleLanguage = () => {
    const next = language === 'fr' ? 'en' : 'fr';
    setLanguage(next);
    localStorage.setItem('medarchive-language', next);
    applyLanguage(next);
    window.dispatchEvent(new CustomEvent('medarchive:language-change', { detail: next }));
  };

  return (
    <header className={`topbar ${isScrolled ? 'scrolled' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="icon-btn" type="button" aria-label="Ouvrir le menu" onClick={onToggleSidebar}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="brand">MedArchive</div>
      </div>
      <div className="top-actions">
        <button className="icon-btn" type="button" aria-label="Changer la langue" title={language === 'fr' ? 'Passer en anglais' : 'Switch to French'} onClick={toggleLanguage}>
          <strong style={{ fontSize: 13 }}>{language === 'fr' ? 'EN' : 'FR'}</strong>
        </button>
        <button className="icon-btn" type="button" aria-label="Mode nuit" aria-pressed={isDarkMode} onClick={onToggleDarkMode}>
          <i className={isDarkMode ? 'fa-regular fa-sun' : 'fa-regular fa-moon'}></i>
        </button>
        <button className="icon-btn has-badge" type="button" aria-label="Messages" onClick={() => setShowChart(true)}>
          <i className="fa-regular fa-envelope"></i>
          <span className="badge">5</span>
        </button>
        <button className="icon-btn has-badge" type="button" aria-label="Ouvrir les notifications" onClick={() => navigate(notificationsPath)}>
          <i className="fa-regular fa-bell"></i>
          {unreadNotifications > 0 && <span className="badge">{unreadNotifications}</span>}
        </button>
        <div className="profile">
          {avatar ? <img src={avatar} alt="" /> : <AvatarInitials name={name} size={45} bgColor="#13c3b8" />}
          <div>
            <strong>{name}</strong>
            <span>{role}</span>
          </div>
        </div>
      </div>
      {showChart && (
        <div className="chart-modal-backdrop" onClick={() => setShowChart(false)}>
          <div className="chart-modal" onClick={(event) => event.stopPropagation()}>
            <button className="chart-modal-close" type="button" onClick={() => setShowChart(false)} aria-label="Fermer">&times;</button>
            <Chart isDarkMode={isDarkMode} />
          </div>
        </div>
      )}
    </header>
  );
}
