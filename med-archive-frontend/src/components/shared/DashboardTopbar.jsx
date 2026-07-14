import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthUser, setAuthSession } from '../../api/client';
import { getCurrentUser } from '../../api/authApi';
import { getNotifications } from '../../api/notificationApi';
import AvatarInitials from '../AvatarInitials.jsx';
import Chart from '../Chart.jsx';
import { applyLanguage } from '../../utils/language.js';

function unwrapUser(auth) {
  return auth?.data?.data?.user || auth?.data?.user || auth?.user || auth?.data || auth || {};
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [user, setUser] = useState(() => unwrapUser(getAuthUser()));
  const profileRef = useRef(null);
  const name = user.name || fallbackName;
  const role = user.role?.nom || user.role?.name || user.numero_professionnel || user.imu || fallbackRole;
  const avatar = user.avatar || null;
  const basePath = location.pathname.split('/').filter(Boolean)[0] || '';
  const quickLinks = [
    ...(basePath === 'espacepatient' || basePath === 'espacemedecin' ? [{ label: 'Mon profil', icon: 'fa-user', to: `/${basePath}/profil` }] : []),
    ...(basePath === 'espacepatient' || basePath === 'espacemedecin' ? [{ label: 'Préférences', icon: 'fa-sliders', to: `/${basePath}/preferences-notifications` }] : []),
    { label: 'Notifications', icon: 'fa-bell', to: notificationsPath },
    { label: 'Paramètres', icon: 'fa-gear', to: basePath === 'espaceadmin' ? '/espaceadmin/parametres-admin' : `/${basePath}/parametres` },
  ];

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((response) => {
      const currentUser = unwrapUser(response);
      if (mounted && currentUser?.id) {
        setUser(currentUser);
        setAuthSession({ user: currentUser });
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

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
      <div className="topbar-brand-group">
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
        </button>
        <button className="icon-btn has-badge" type="button" aria-label="Ouvrir les notifications" onClick={() => navigate(notificationsPath)}>
          <i className="fa-regular fa-bell"></i>
          {unreadNotifications > 0 && <span className="badge">{unreadNotifications}</span>}
        </button>
        <div className="profile-menu-wrap" ref={profileRef}>
          <button className="profile profile-trigger" type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-haspopup="menu">
            {avatar ? <img src={avatar} alt="" /> : <AvatarInitials name={name} size={45} bgColor="#13c3b8" />}
            <div><strong>{name}</strong><span>{role}</span></div>
            <i className={`fa-solid fa-chevron-down profile-chevron ${profileOpen ? 'open' : ''}`} />
          </button>
          {profileOpen && <div className="profile-quick-menu" role="menu">
            <div className="profile-quick-head">
              {avatar ? <img src={avatar} alt="" /> : <AvatarInitials name={name} size={48} bgColor="#13c3b8" />}
              <div><strong>{name}</strong><span>{user.email || role}</span></div>
            </div>
            <div className="profile-quick-links">
              {quickLinks.map((item) => <button key={item.to} type="button" role="menuitem" onClick={() => { setProfileOpen(false); navigate(item.to); }}><i className={`fa-solid ${item.icon}`} />{item.label}</button>)}
            </div>
            <button className="profile-signout" type="button" role="menuitem" onClick={() => { setProfileOpen(false); navigate('/deconnexion'); }}><i className="fa-solid fa-right-from-bracket" />Se déconnecter</button>
          </div>}
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
