import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const SidebarAccueil = () => {
  const [userPanelOpen, setUserPanelOpen] = useState(false);

  const toggleUserPanel = () => setUserPanelOpen(prev => !prev);

  return (
    <aside className="sidebar">
      <div className="sidebar-title-row">
        <h3>Navigation</h3>
        <button
          className="sidebar-user-toggle"
          onClick={toggleUserPanel}
          aria-expanded={userPanelOpen}
        >
          <i className="fa-regular fa-user"></i>
        </button>
      </div>

      <div className={`sidebar-user-panel ${userPanelOpen ? 'open' : ''}`}>
        <img src="https://i.pravatar.cc/200?img=32" alt="Dr Alice" />
        <strong>BAH Konie</strong>
        <span>Service: Medecine generale</span>
      </div>

      <div className="menu-block">
        <NavLink end to="/espaceaccueil" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <i className="fa-solid fa-house"></i><span>Dashboard</span>
        </NavLink>

        <NavLink to="/espaceaccueil/medecins" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <i className="fa-solid fa-user-doctor"></i><span>Medecins</span>
        </NavLink>

        <NavLink to="/espaceaccueil/patients" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <i className="fa-solid fa-user-injured"></i><span>Patients</span>
        </NavLink>

        <NavLink to="/espaceaccueil/transfert" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <i className="fa-solid fa-exchange-alt"></i><span>Transfert</span>
        </NavLink>

        <NavLink to="/espaceaccueil/rendez-vous" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <i className="fa-solid fa-calendar"></i><span>Rendez-vous</span>
        </NavLink>

        <h4>Gestion du compte</h4>
        <div className="menu-block">
          {/* <a className="menu-item" href="/espacemedecin/publications">
            <i className="fa-regular fa-newspaper"></i><span>Publications</span>
          </a> */}
          <a className="menu-item" href="/espacemedecin/notifications">
            <i className="fa-regular fa-bell"></i><span>Notifications</span>
          </a>
          <a className="menu-item" href="/espacemedecin/profil">
            <i className="fa-regular fa-user"></i><span>Profil</span>
          </a>
        </div>

        <div className="sidebar-profile">
          <img src="https://i.pravatar.cc/80?img=32" alt="Dr Alice" />
          <div>
            <strong>BAH Konie</strong>
            <span>ID: MED-24-007</span>
          </div>
          <a className="settings-link" href="/espacemedecin/parametres">
            <i className="fa-solid fa-gear"></i>
          </a>
        </div>

        <a className="sidebar-help" href="#">
          <i className="fa-solid fa-headset"></i>
          <span>Besoin d'aide ? Contacter le support</span>
          <i className="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    </aside>
  );
};

export default SidebarAccueil;