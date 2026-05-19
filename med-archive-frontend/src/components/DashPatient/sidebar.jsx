import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);

  const dossierPaths = [
    '/espacepatient/consultations',
    '/espacepatient/resultats-analyses',
    '/espacepatient/ordonnances',
    '/espacepatient/documents-medicaux'
  ];
  const isDossierActive = dossierPaths.some(path => location.pathname === path);

  useEffect(() => {
    setIsDossierOpen(isDossierActive);
  }, [isDossierActive]);

  const toggleDossierMenu = (e) => {
    e.preventDefault();
    setIsDossierOpen(!isDossierOpen);
  };

  const toggleUserPanel = () => setIsUserPanelOpen(!isUserPanelOpen);

  return (
    <aside className="sidebar">
      <div className="sidebar-title-row">
        <h3>Navigation</h3>
        <button
          className="sidebar-user-toggle"
          onClick={toggleUserPanel}
          aria-expanded={isUserPanelOpen}
        >
          <i className="fa-regular fa-user"></i>
        </button>
      </div>

      <div className={`sidebar-user-panel ${isUserPanelOpen ? 'open' : ''}`}>
        <img src="https://i.pravatar.cc/200?img=12" alt="John Doe" />
        <strong>John Doe</strong>
        <span>IMU: 24P-001</span>
      </div>

      <div className="menu-block">
        <NavLink to="/espacepatient" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} end>
          <i className="fa-solid fa-house"></i><span>Dashboard</span>
        </NavLink>

        <a
          href="#"
          className={`menu-item menu-parent ${isDossierOpen ? 'open' : ''}`}
          onClick={toggleDossierMenu}
          aria-expanded={isDossierOpen}
        >
          <i className="fa-solid fa-folder-open"></i><span>Mon dossier médical</span>
          <i className="fa-solid fa-chevron-down submenu-arrow"></i>
        </a>

        <div className={`submenu-block ${isDossierOpen ? 'open' : ''}`}>
          <NavLink to="/espacepatient/consultations" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
            Historique des consultations
          </NavLink>
          <NavLink to="/espacepatient/resultats-analyses" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
            Résultats d'analyses
          </NavLink>
          <NavLink to="/espacepatient/ordonnances" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
            Ordonnances
          </NavLink>
          <NavLink to="/espacepatient/documents-medicaux" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
            Documents médicaux
          </NavLink>
        </div>
        <NavLink to="/espacepatient/rendez-vous" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-calendar"></i><span>Mes Rendez-vous</span>
        </NavLink>

        <NavLink to="/espacepatient/traitements" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-pills"></i><span>Mes traitements</span>
        </NavLink>

        <NavLink to="/espacepatient/acces-donnees" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-key"></i><span>Accès à mes données</span>
        </NavLink>
      </div>

      <h4>Gestion du compte</h4>
      <div className="menu-block">
        <NavLink to="/espacepatient/notifications" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <i className="fa-regular fa-bell"></i><span>Notifications</span>
        </NavLink>
        <NavLink to="/espacepatient/profil" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <i className="fa-regular fa-user"></i><span>Profil</span>
        </NavLink>
      </div>

      <div className="sidebar-profile">
        <img src="https://i.pravatar.cc/80?img=12" alt="John Doe" />
        <div>
          <strong>John Doe</strong>
          <span>IMU: 24P-001</span>
        </div>
        <NavLink to="/espacepatient/parametres" className="settings-link">
          <i className="fa-solid fa-gear"></i>
        </NavLink>
      </div>

      <a href="#" className="sidebar-help">
        <i className="fa-solid fa-headset"></i>
        <span>Besoin d'aide ? Contacter le support</span>
        <i className="fa-solid fa-arrow-up-right-from-square"></i>
      </a>
    </aside>
  );
};

export default Sidebar;